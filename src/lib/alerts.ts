export type AlertItem = {
  domain: string;
  date: string;
  spam_rate: number | null;
  domain_reputation: string | null;
  severity: "WARNING" | "CRITICAL";
  reason: string;
};

export async function fetchRecentAlerts(domain?: string, days = 30): Promise<AlertItem[]> {
  const qs = new URLSearchParams();
  if (domain) qs.set("domain", domain);
  qs.set("days", String(days));
  
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;
  if (!API_BASE) {
    throw new Error('NEXT_PUBLIC_API_URL is required');
  }
  
  const res = await fetch(`${API_BASE}/alerts/recent?${qs.toString()}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`alerts/recent ${res.status}`);
  const j = await res.json();
  return (j?.data ?? []) as AlertItem[];
}

export function formatPct(n?: number | null) {
  if (n == null) return "—";
  return `${(n * 100).toFixed(2)}%`;
} 