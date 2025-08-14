import { useState, useEffect } from 'react';

const DOMAIN_STORAGE_KEY = 'inbox-guard-domain';

export function getSavedDomain(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(DOMAIN_STORAGE_KEY);
}

export function saveDomain(domain: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DOMAIN_STORAGE_KEY, domain);
  
  // Emit storage event for cross-tab sync
  window.dispatchEvent(new StorageEvent('storage', {
    key: DOMAIN_STORAGE_KEY,
    newValue: domain,
    oldValue: localStorage.getItem(DOMAIN_STORAGE_KEY),
    storageArea: localStorage,
  }));
}

export function getDefaultDomain(): string {
  const defaultDomain = process.env.NEXT_PUBLIC_DEFAULT_DOMAIN || process.env.DEFAULT_DOMAIN || 'branddeliverability.org';
  return getSavedDomain() || defaultDomain;
}

export function getDefaultDkimSelector(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_DKIM_SELECTOR || process.env.DEFAULT_DKIM_SELECTOR || 'selector1._domainkey';
}

export function useDomain() {
  const [domain, setDomainState] = useState(() => getDefaultDomain());

  const setDomain = (newDomain: string) => {
    setDomainState(newDomain);
    saveDomain(newDomain);
  };

  useEffect(() => {
    // Listen for storage events from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === DOMAIN_STORAGE_KEY && event.newValue) {
        setDomainState(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { domain, setDomain };
} 