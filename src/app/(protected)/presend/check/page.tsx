"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ApiError, useApi } from "@/lib/api";
import { FormCard } from "@/components/FormCard";
import { StatusBadge } from "@/components/StatusBadge";
import { CopyButton } from "@/components/CopyButton";
import { useToast } from "@/components/ToastHost";

interface PresendResult {
  decision: "PASS" | "BLOCK" | "PASS_WITH_OVERRIDE";
  reasons: string[];
  checklist: string[];
  fix_snippets: string[];
  latest_metrics: {
    date?: string;
    spam_rate?: number;
    domain_reputation?: string;
  };
}

export default function PresendCheckPage() {
  const { showToast } = useToast();
  const { apiFetch } = useApi();
  const [domain, setDomain] = useState("branddeliverability.org");
  const [rawHeaders, setRawHeaders] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PresendResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [overrideChecked, setOverrideChecked] = useState<string[]>([]);

  async function runCheck(allowOverride = false) {
    if (!domain.trim()) {
      setError("Domain is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch("/presend/check", {
        method: "POST",
        body: JSON.stringify({
          domain: domain.trim(),
          raw_headers: rawHeaders.trim() || undefined,
          allow_override: allowOverride,
          acknowledgments: allowOverride ? overrideChecked : [],
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.detail || `presend/check ${response.status}`;
        throw new ApiError(message, response.status, errorData);
      }
      const result = (await response.json()) as PresendResult;
      setResult(result);

      if (result.decision === "PASS") {
        showToast("Pre-send check passed!", "success");
      } else if (result.decision === "PASS_WITH_OVERRIDE") {
        showToast("Override acknowledged - proceed with caution", "success");
      } else {
        showToast("Pre-send check blocked - review checklist", "error");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Pre-send check failed";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }

  const blocked = result?.decision === "BLOCK";
  const pass = result?.decision === "PASS";
  const passOverride = result?.decision === "PASS_WITH_OVERRIDE";

  const getDecisionStatus = () => {
    if (pass) return "pass";
    if (passOverride) return "warn";
    return "fail";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pre-send Check</h1>
          <p className="mt-2 text-gray-600">
            Check email compliance and domain reputation before sending
          </p>
        </div>

        <FormCard title="Pre-send Compliance Check" className="mb-8">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="domain"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Domain *
              </label>
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="headers"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Raw Headers (Optional)
              </label>
              <textarea
                id="headers"
                value={rawHeaders}
                onChange={(e) => setRawHeaders(e.target.value)}
                placeholder="Paste full email headers here to check List-Unsubscribe compliance..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-40 font-mono text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => runCheck(false)}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Checking..." : "Run Check"}
              </button>

              {blocked && (
                <button
                  onClick={() => runCheck(true)}
                  disabled={loading || overrideChecked.length === 0}
                  className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Override with Acknowledgment
                </button>
              )}
            </div>
          </div>
        </FormCard>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Decision Result */}
            <FormCard title="Decision">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <StatusBadge status={getDecisionStatus()}>
                    {result.decision.replace("_", " ")}
                  </StatusBadge>
                </div>

                {result.latest_metrics &&
                  Object.keys(result.latest_metrics).length > 0 && (
                    <div className="text-xs text-gray-600 border-t pt-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="font-medium">Latest Data</div>
                          <div>{result.latest_metrics.date || "—"}</div>
                        </div>
                        <div>
                          <div className="font-medium">Spam Rate</div>
                          <div>
                            {result.latest_metrics.spam_rate
                              ? `${(
                                  result.latest_metrics.spam_rate * 100
                                ).toFixed(1)}%`
                              : "—"}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Reputation</div>
                          <div>
                            {result.latest_metrics.domain_reputation || "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </FormCard>

            {/* Reasons */}
            {result.reasons && result.reasons.length > 0 && (
              <FormCard title="Issues Found">
                <ul className="space-y-2">
                  {result.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                      <span className="text-sm text-gray-900">{reason}</span>
                    </li>
                  ))}
                </ul>
              </FormCard>
            )}

            {/* Remediation Checklist (only for BLOCK) */}
            {blocked && result.checklist && result.checklist.length > 0 && (
              <FormCard title="Remediation Checklist">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Acknowledge all items below to override the block (use with
                    caution):
                  </p>
                  <div className="space-y-3">
                    {result.checklist.map((item, i) => (
                      <label
                        key={i}
                        className="flex items-start space-x-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={overrideChecked.includes(item)}
                          onChange={(e) => {
                            setOverrideChecked((prev) =>
                              e.target.checked
                                ? [...prev, item]
                                : prev.filter((x) => x !== item)
                            );
                          }}
                          className="mt-1 flex-shrink-0"
                        />
                        <span className="text-sm text-gray-900">{item}</span>
                      </label>
                    ))}
                  </div>

                  {overrideChecked.length === result.checklist.length && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="text-sm text-amber-800">
                        All items acknowledged. You can now override the block,
                        but proceed with caution.
                      </p>
                    </div>
                  )}
                </div>
              </FormCard>
            )}

            {/* Fix Snippets */}
            {result.fix_snippets && result.fix_snippets.length > 0 && (
              <FormCard title="Header Fix Snippets">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Copy these headers into your email template (replace
                    YOURDOMAIN with your actual domain):
                  </p>
                  <div className="bg-gray-50 rounded-md p-4 relative">
                    <pre className="text-xs text-gray-900 whitespace-pre-wrap overflow-auto">
                      {result.fix_snippets.join("\n")}
                    </pre>
                    <div className="absolute top-2 right-2">
                      <CopyButton value={result.fix_snippets.join("\n")} />
                    </div>
                  </div>
                </div>
              </FormCard>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
