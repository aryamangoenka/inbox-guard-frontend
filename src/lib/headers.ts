export type HeaderLint = { 
  issues: string[]; 
  fixes: string[]; 
  isCompliant: boolean;
};

export function lintUnsubscribeHeaders(raw: string): HeaderLint {
  const issues: string[] = [];
  const fixes: string[] = [
    "List-Unsubscribe: <mailto:unsubscribe@YOURDOMAIN.com>, <https://YOURDOMAIN.com/unsubscribe?u={{user_id}}>",
    "List-Unsubscribe-Post: List-Unsubscribe=One-Click",
  ];
  
  const lower = (raw || "").toLowerCase();
  
  // Check for List-Unsubscribe header
  if (!lower.includes("list-unsubscribe:")) {
    issues.push("Missing List-Unsubscribe header.");
  } else {
    // Check for both mailto and https URLs
    const listUnsub = extractHeader(raw, "list-unsubscribe");
    if (listUnsub) {
      if (!listUnsub.includes("mailto:")) {
        issues.push("List-Unsubscribe should include a mailto: URL.");
      }
      if (!listUnsub.includes("https://") && !listUnsub.includes("http://")) {
        issues.push("List-Unsubscribe should include an HTTP(S) URL.");
      }
    }
  }
  
  // Check for List-Unsubscribe-Post header
  if (!lower.includes("list-unsubscribe-post:")) {
    issues.push("Missing List-Unsubscribe-Post header (required for One-Click).");
  } else {
    const postHeader = extractHeader(raw, "list-unsubscribe-post");
    if (postHeader && !postHeader.toLowerCase().includes("list-unsubscribe=one-click")) {
      issues.push("List-Unsubscribe-Post must contain 'List-Unsubscribe=One-Click'.");
    }
  }
  
  return { 
    issues, 
    fixes, 
    isCompliant: issues.length === 0 
  };
}

function extractHeader(raw: string, headerName: string): string | null {
  const regex = new RegExp(`^${headerName}:\\s*(.+)$`, 'im');
  const match = raw.match(regex);
  return match ? match[1].trim() : null;
}

export function getComplianceStatus(lint: HeaderLint): {
  status: "compliant" | "warning" | "critical";
  message: string;
} {
  if (lint.isCompliant) {
    return {
      status: "compliant",
      message: "✅ Headers are RFC 8058 compliant"
    };
  }
  
  const hasUnsubHeader = !lint.issues.some(issue => issue.includes("Missing List-Unsubscribe header"));
  const hasPostHeader = !lint.issues.some(issue => issue.includes("Missing List-Unsubscribe-Post header"));
  
  if (!hasUnsubHeader || !hasPostHeader) {
    return {
      status: "critical",
      message: "❌ Missing required headers for One-Click unsubscribe"
    };
  }
  
  return {
    status: "warning",
    message: "⚠️ Headers present but need fixes for full compliance"
  };
} 