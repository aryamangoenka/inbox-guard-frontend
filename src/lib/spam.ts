export type SpamVerdict = "LOW" | "ELEVATED" | "HIGH";

export function spamRiskVerdict(rate: number): SpamVerdict {
  if (rate >= 0.30) return "HIGH";
  if (rate >= 0.25) return "ELEVATED";
  return "LOW";
}

export function getSpamRiskColor(verdict: SpamVerdict): string {
  switch (verdict) {
    case "LOW": return "text-green-600";
    case "ELEVATED": return "text-amber-600";
    case "HIGH": return "text-red-600";
  }
}

export function getSpamRiskBgColor(verdict: SpamVerdict): string {
  switch (verdict) {
    case "LOW": return "bg-green-100";
    case "ELEVATED": return "bg-amber-100";
    case "HIGH": return "bg-red-100";
  }
}

export function getSpamRiskMessage(verdict: SpamVerdict): string {
  switch (verdict) {
    case "LOW": 
      return "✅ Excellent deliverability. Your emails are likely reaching the inbox.";
    case "ELEVATED": 
      return "⚠️ Elevated risk. Monitor closely and review email practices.";
    case "HIGH": 
      return "❌ High risk. Immediate action required to prevent delivery issues.";
  }
}

export function getSpamRiskRecommendations(verdict: SpamVerdict): string[] {
  switch (verdict) {
    case "LOW":
      return [
        "Maintain current email practices",
        "Continue monitoring metrics",
        "Keep list hygiene protocols"
      ];
    case "ELEVATED":
      return [
        "Review email content for spam triggers",
        "Check list acquisition methods",
        "Improve engagement rates",
        "Implement better list segmentation"
      ];
    case "HIGH":
      return [
        "Immediately pause email campaigns",
        "Review all recent email content",
        "Clean email list of inactive subscribers",
        "Check for compromised sending infrastructure",
        "Contact email service provider"
      ];
  }
}

export function formatSpamRate(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
} 