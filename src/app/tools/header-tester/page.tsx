"use client";

import { useState } from "react";
import { lintUnsubscribeHeaders, getComplianceStatus } from "@/lib/headers";

export default function HeaderTesterPage() {
  const [raw, setRaw] = useState("");
  const lint = lintUnsubscribeHeaders(raw);
  const compliance = getComplianceStatus(lint);

  const statusColors = {
    compliant: "text-green-700 bg-green-100 border-green-200",
    warning: "text-amber-700 bg-amber-100 border-amber-200",
    critical: "text-red-700 bg-red-100 border-red-200",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          RFC 8058 Header Tester
        </h2>
        <p className="text-gray-600">
          Test your email headers for One-Click unsubscribe compliance (RFC
          8058). Paste your email headers below to check for proper
          List-Unsubscribe implementation.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="headers-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email Headers
          </label>
          <textarea
            id="headers-input"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            rows={8}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={`From: newsletter@company.com
To: subscriber@example.com
Subject: Monthly Newsletter
List-Unsubscribe: <mailto:unsubscribe@company.com>, <https://company.com/unsubscribe?id=123>
List-Unsubscribe-Post: List-Unsubscribe=One-Click

Your email content here...`}
          />
        </div>

        {raw.trim() && (
          <div className="space-y-4">
            <div
              className={`rounded-lg p-4 border ${
                statusColors[compliance.status]
              }`}
            >
              <div className="font-medium mb-2">{compliance.message}</div>

              {lint.issues.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Issues Found:</div>
                  <ul className="text-sm space-y-1">
                    {lint.issues.map((issue, i) => (
                      <li key={i} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                ✅ Required Headers (RFC 8058):
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    List-Unsubscribe
                  </div>
                  <code className="text-xs text-gray-600 bg-white p-2 rounded block mt-1 break-all">
                    List-Unsubscribe: &lt;mailto:unsubscribe@yourdomain.com&gt;,
                    &lt;https://yourdomain.com/unsubscribe?id=&#123;&#123;user_id&#125;&#125;&gt;
                  </code>
                  <div className="text-xs text-gray-500 mt-1">
                    Must include both mailto: and https: URLs
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700">
                    List-Unsubscribe-Post
                  </div>
                  <code className="text-xs text-gray-600 bg-white p-2 rounded block mt-1">
                    List-Unsubscribe-Post: List-Unsubscribe=One-Click
                  </code>
                  <div className="text-xs text-gray-500 mt-1">
                    Enables one-click unsubscribe in email clients
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                💡 Implementation Tips:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Both mailto: and https: URLs should actually work</li>
                <li>
                  • The https: URL should accept POST requests for one-click
                </li>
                <li>• Include user identification in unsubscribe URLs</li>
                <li>• Test unsubscribe flow in major email clients</li>
                <li>
                  • Honor unsubscribe requests immediately (within 24-48 hours)
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-amber-900 mb-2">
                ⚠️ Important Notes:
              </h3>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>
                  • Gmail, Yahoo, and Apple Mail support one-click unsubscribe
                </li>
                <li>• Non-compliance may affect deliverability ratings</li>
                <li>
                  • Required for bulk commercial email (CAN-SPAM compliance)
                </li>
                <li>• Should be present in all marketing/promotional emails</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
