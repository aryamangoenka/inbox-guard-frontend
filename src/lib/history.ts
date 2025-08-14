import { get, set, del } from 'idb-keyval';

export interface HistoryRow {
  date: string;
  spam_rate?: number;
  domain_reputation?: string;
}

const getHistoryKey = (domain: string) => `postmaster_history_${domain}`;

export async function historyAppend(domain: string, rows: HistoryRow[]): Promise<void> {
  try {
    const key = getHistoryKey(domain);
    const existing = (await get<HistoryRow[]>(key)) || [];
    
    // Create a map for deduplication by date
    const dateMap = new Map<string, HistoryRow>();
    
    // Add existing rows
    existing.forEach(row => {
      dateMap.set(row.date, row);
    });
    
    // Add new rows (overwrites if same date)
    rows.forEach(row => {
      dateMap.set(row.date, row);
    });
    
    // Convert back to array and sort by date
    const merged = Array.from(dateMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    await set(key, merged);
  } catch (error) {
    console.error('Failed to append history:', error);
    throw new Error('Failed to save historical data');
  }
}

export async function historyLoad(domain: string): Promise<HistoryRow[]> {
  try {
    const key = getHistoryKey(domain);
    const history = await get<HistoryRow[]>(key);
    return history || [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

export async function historyClear(domain: string): Promise<void> {
  try {
    const key = getHistoryKey(domain);
    await del(key);
  } catch (error) {
    console.error('Failed to clear history:', error);
    throw new Error('Failed to clear historical data');
  }
} 