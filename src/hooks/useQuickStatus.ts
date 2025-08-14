import { useState, useEffect, useCallback, useRef } from 'react';
import { apiGet } from '@/lib/api';

export type TileState<T> = {
  loading: boolean;
  error?: string;
  data?: T;
  lastUpdated?: number;
};

export type QuickStatus = {
  api: TileState<{ ok: boolean }>;
  dns: TileState<{ spfStatus: 'pass' | 'warn' | 'fail'; lookupCount: number; dmarcValid: boolean }>;
  dkim: TileState<{ found: boolean; target?: string }>;
  postmaster: TileState<{ spamRate?: number; reputation?: string }>;
};

export function useQuickStatus(domain: string) {
  const [status, setStatus] = useState<QuickStatus>({
    api: { loading: false },
    dns: { loading: false },
    dkim: { loading: false },
    postmaster: { loading: false },
  });
  
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  const refreshInterval = parseInt(process.env.NEXT_PUBLIC_QUICK_STATUS_REFRESH_MS || '60000');
  const dkimSelector = process.env.NEXT_PUBLIC_DEFAULT_DKIM_SELECTOR || 'selector1._domainkey';

  const updateTileState = useCallback(<T,>(
    tile: keyof QuickStatus,
    update: Partial<TileState<T>>
  ) => {
    setStatus(prev => ({
      ...prev,
      [tile]: {
        ...prev[tile],
        ...update,
        lastUpdated: update.data ? Date.now() : prev[tile].lastUpdated,
      },
    }));
  }, []);

  const fetchApiStatus = useCallback(async () => {
    updateTileState('api', { loading: true, error: undefined });
    try {
      const result = await apiGet<{ status: string }>('/health');
      updateTileState('api', {
        loading: false,
        data: { ok: result.status === 'ok' },
      });
    } catch (error) {
      updateTileState('api', {
        loading: false,
        error: error instanceof Error ? error.message : 'API check failed',
      });
    }
  }, [updateTileState]);

  const fetchDnsStatus = useCallback(async () => {
    if (!domain) return;
    
    updateTileState('dns', { loading: true, error: undefined });
    try {
      const result = await apiGet<{
        success: boolean;
        data: {
          spf: { status: 'pass' | 'warn' | 'fail'; lookup_count: number };
          dmarc: { exists: boolean; valid: boolean };
        };
      }>('/dns/check', { zone_root: domain });
      
      updateTileState('dns', {
        loading: false,
        data: {
          spfStatus: result.data.spf.status,
          lookupCount: result.data.spf.lookup_count,
          dmarcValid: result.data.dmarc.exists && result.data.dmarc.valid,
        },
      });
    } catch (error) {
      updateTileState('dns', {
        loading: false,
        error: error instanceof Error ? error.message : 'DNS check failed',
      });
    }
  }, [domain, updateTileState]);

  const fetchDkimStatus = useCallback(async () => {
    if (!domain) return;
    
    updateTileState('dkim', { loading: true, error: undefined });
    try {
      const result = await apiGet<{
        success: boolean;
        data: Array<{ content: string }>;
      }>('/dns/records', {
        zone_root: domain,
        name: `${dkimSelector}.${domain}`,
        type: 'CNAME',
      });
      
      updateTileState('dkim', {
        loading: false,
        data: {
          found: result.data.length > 0,
          target: result.data[0]?.content,
        },
      });
    } catch (error) {
      updateTileState('dkim', {
        loading: false,
        error: error instanceof Error ? error.message : 'DKIM check failed',
      });
    }
  }, [domain, dkimSelector, updateTileState]);

  const fetchPostmasterStatus = useCallback(async () => {
    if (!domain) return;
    
    updateTileState('postmaster', { loading: true, error: undefined });
    try {
      const result = await apiGet<{
        success: boolean;
        data: { spam_rate: number; domain_reputation: string };
      }>('/postmaster/latest', { domain });
      
      updateTileState('postmaster', {
        loading: false,
        data: {
          spamRate: result.data.spam_rate,
          reputation: result.data.domain_reputation,
        },
      });
    } catch (error) {
      updateTileState('postmaster', {
        loading: false,
        error: error instanceof Error ? error.message : 'Postmaster check failed',
      });
    }
  }, [domain, updateTileState]);

  const refetch = useCallback(async () => {
    await Promise.all([
      fetchApiStatus(),
      fetchDnsStatus(),
      fetchDkimStatus(),
      fetchPostmasterStatus(),
    ]);
  }, [fetchApiStatus, fetchDnsStatus, fetchDkimStatus, fetchPostmasterStatus]);

  const pauseAutoRefresh = useCallback(() => {
    setIsAutoRefresh(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  const resumeAutoRefresh = useCallback(() => {
    setIsAutoRefresh(true);
  }, []);

  // Set up auto-refresh interval
  useEffect(() => {
    if (isAutoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(refetch, refreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isAutoRefresh, refreshInterval, refetch]);

  // Initial fetch when domain changes
  useEffect(() => {
    if (domain) {
      refetch();
    }
  }, [domain, refetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    status,
    refetch,
    isAutoRefresh,
    pauseAutoRefresh,
    resumeAutoRefresh,
  };
} 