export function countSpfLookups(spf: string): number {
  const lower = spf.toLowerCase();
  let count = 0;
  
  // Mechanisms that cause DNS lookups
  const mechanisms = [
    'include:',
    'redirect=',
    'a:',
    'mx:',
    'exists:',
    'ptr:'
  ];
  
  // Count mechanisms with domains
  for (const mech of mechanisms) {
    const regex = new RegExp(mech.replace(/[.*+?^${}()|[\]\\]/g, '\\$1'), 'g');
    const matches = lower.match(regex);
    if (matches) count += matches.length;
  }
  
  // Count standalone mechanisms (a, mx, ptr without domain)
  if (/\ba\b(?!:)/.test(lower)) count++;
  if (/\bmx\b(?!:)/.test(lower)) count++;
  if (/\bptr\b(?!:)/.test(lower)) count++;
  
  return count;
}

export function getSpfTone(count: number): "green" | "amber" | "red" {
  if (count < 8) return "green";
  if (count < 10) return "amber";
  return "red";
}

export function getSpfGuidance(count: number): string {
  if (count < 8) return "✅ Excellent - Well within limits";
  if (count < 10) return "⚠️ Warning - Close to limit";
  return "❌ Critical - Exceeds RFC limit";
} 