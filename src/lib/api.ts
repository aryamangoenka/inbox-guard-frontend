const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

if (!API_BASE) {
  throw new Error('NEXT_PUBLIC_API_URL is required. Please set it in your environment variables.');
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  timeoutMs?: number;
  retries?: number;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry<T>(
  path: string,
  options: RequestInit & RequestOptions = {}
): Promise<T> {
  const { timeoutMs = 12000, retries = 2, ...fetchOptions } = options;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        let errorBody;
        
        try {
          errorBody = await response.json();
          errorMessage = errorBody.detail || errorBody.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        
        const error = new ApiError(errorMessage, response.status, errorBody);
        
        // Don't retry 4xx errors
        if (response.status >= 400 && response.status < 500) {
          throw error;
        }
        
        // Retry 5xx errors if attempts remain
        if (attempt < retries) {
          const backoffMs = 300 * Math.pow(2, attempt);
          await sleep(backoffMs);
          continue;
        }
        
        throw error;
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle network errors, timeouts, and aborts
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Retry network errors if attempts remain
      if (attempt < retries) {
        const backoffMs = 300 * Math.pow(2, attempt);
        await sleep(backoffMs);
        continue;
      }
      
      // Transform generic errors into ApiError
      const message = error instanceof Error ? error.message : 'Network error';
      throw new ApiError(message, 0);
    }
  }
  
  // This should never be reached
  throw new ApiError('Max retries exceeded', 0);
}

export async function apiGet<T>(
  path: string, 
  params?: Record<string, string | number | boolean>,
  options?: RequestOptions
): Promise<T> {
  const searchParams = params ? new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)])
  ).toString() : '';
  const url = searchParams ? `${path}?${searchParams}` : path;
  
  return fetchWithRetry<T>(url, options);
}

export async function apiPost<T>(
  path: string, 
  body?: unknown, 
  requireKey = false,
  options?: RequestOptions
): Promise<T> {
  const headers: Record<string, string> = {};
  
  if (requireKey) {
    if (!API_KEY) {
      throw new ApiError('API key required for this operation. Please set NEXT_PUBLIC_API_KEY.', 401);
    }
    headers['X-API-Key'] = API_KEY;
  }

  return fetchWithRetry<T>(path, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    headers,
  });
}

export async function getPostmasterMetrics(domain: string, days = 14) {
  const url = `/postmaster/metrics?domain=${encodeURIComponent(domain)}&days=${days}`;
  const res = await fetchWithRetry<{ success: boolean; data: Array<{ date: string; spam_rate?: number; domain_reputation?: string }> }>(url);
  return res.data || []; // Return [] or [{ date, spam_rate, domain_reputation }]
}

export async function postPresendCheck(body: {
  domain: string;
  raw_headers?: string;
  allow_override?: boolean;
  acknowledgments?: string[];
}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }

  const response = await fetch(`${API_BASE}/presend/check`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.detail || `presend/check ${response.status}`;
    const error = new ApiError(message, response.status, errorData);
    throw error;
  }

  const data = await response.json();
  return data as {
    decision: "PASS" | "BLOCK" | "PASS_WITH_OVERRIDE";
    reasons: string[];
    checklist: string[];
    fix_snippets: string[];
    latest_metrics: { date?: string; spam_rate?: number; domain_reputation?: string };
  };
}

export type AutofixChange = {
  action: string;               // e.g., "SPF_PATCH", "DMARC_CREATE"
  type?: string;                // TXT/CNAME
  name?: string;                // FQDN
  old_value?: string | null;    // "before"
  content?: string | null;      // "after" (new value)
  record_id?: string | null;    // provider record id
};

export type AutofixPlanResult = {
  success: boolean;
  changes: AutofixChange[];
  notes?: string[];
};

export async function dnsAutofixPlan(zone_root: string): Promise<AutofixPlanResult> {
  const res = await fetch(`${API_BASE}/dns/autofix`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ zone_root, apply: false }),
  });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new ApiError(data?.detail || `autofix plan ${res.status}`, res.status, data);
  return data as AutofixPlanResult;
}

export async function dnsAutofixApply(zone_root: string): Promise<AutofixPlanResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (API_KEY) {
    headers["X-API-Key"] = API_KEY;
  }

  const res = await fetch(`${API_BASE}/dns/autofix`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({ zone_root, apply: true }),
  });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new ApiError(data?.detail || `autofix apply ${res.status}`, res.status, data);
  return data as AutofixPlanResult;
}

export { ApiError };
export type { ApiResponse }; 