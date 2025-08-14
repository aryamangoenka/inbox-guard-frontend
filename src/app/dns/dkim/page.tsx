"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { apiPost, ApiError } from "@/lib/api";
import {
  getDefaultDomain,
  getDefaultDkimSelector,
  saveDomain,
} from "@/lib/domain";
import { FormCard } from "@/components/FormCard";
import { JsonBlock } from "@/components/JsonBlock";
import { StatusBadge } from "@/components/StatusBadge";

interface DKIMSelector {
  host: string;
  target: string;
  ttl?: number;
}

interface DKIMResult {
  success: boolean;
  plan?: Array<{ action: string; type: string; name: string; content: string }>;
  changes?: Array<{
    action: string;
    type: string;
    name: string;
    content: string;
    record_id: string;
  }>;
  postcheck?: Array<{ name: string; resolves_to: string | null; ok: boolean }>;
}

export default function DKIMPage() {
  const [zoneRoot, setZoneRoot] = useState("");
  const [selectors, setSelectors] = useState<DKIMSelector[]>([]);
  const [apply, setApply] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DKIMResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const defaultDomain = getDefaultDomain();
    const defaultSelector = getDefaultDkimSelector();
    setZoneRoot(defaultDomain);
    setSelectors([{ host: defaultSelector, target: "", ttl: 300 }]);
  }, []);

  const addSelector = () => {
    setSelectors([...selectors, { host: "", target: "", ttl: 300 }]);
  };

  const removeSelector = (index: number) => {
    if (selectors.length > 1) {
      setSelectors(selectors.filter((_, i) => i !== index));
    }
  };

  const updateSelector = (
    index: number,
    field: keyof DKIMSelector,
    value: string | number
  ) => {
    const updated = [...selectors];
    updated[index] = { ...updated[index], [field]: value };
    setSelectors(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !zoneRoot.trim() ||
      selectors.some((s) => !s.host.trim() || !s.target.trim())
    ) {
      setError("Please fill in all selector fields");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    saveDomain(zoneRoot.trim());

    try {
      const response = await apiPost<DKIMResult>(
        "/dns/dkim/apply",
        {
          zone_root: zoneRoot.trim(),
          selectors: selectors.map((s) => ({
            host: s.host.trim(),
            target: s.target.trim(),
            ttl: s.ttl || 300,
          })),
          apply,
        },
        apply // require API key for apply
      );
      setResult(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center space-x-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">DKIM Setup</h1>
          <p className="mt-2 text-gray-600">
            Configure DKIM selectors for your domain
          </p>
        </div>

        <FormCard
          title="DKIM Selector Configuration"
          subtitle="Set up CNAME records for DKIM authentication"
          className="mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="zone_root"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Zone Root Domain *
              </label>
              <input
                type="text"
                id="zone_root"
                value={zoneRoot}
                onChange={(e) => setZoneRoot(e.target.value)}
                placeholder="example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  DKIM Selectors *
                </label>
                <button
                  type="button"
                  onClick={addSelector}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Selector
                </button>
              </div>

              <div className="space-y-4">
                {selectors.map((selector, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        Selector {index + 1}
                      </h4>
                      {selectors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSelector(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Host
                        </label>
                        <input
                          type="text"
                          value={selector.host}
                          onChange={(e) =>
                            updateSelector(index, "host", e.target.value)
                          }
                          placeholder="selector1._domainkey"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Target
                        </label>
                        <input
                          type="text"
                          value={selector.target}
                          onChange={(e) =>
                            updateSelector(index, "target", e.target.value)
                          }
                          placeholder="s1.domainkey.provider.net"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          TTL
                        </label>
                        <input
                          type="number"
                          value={selector.ttl}
                          onChange={(e) =>
                            updateSelector(
                              index,
                              "ttl",
                              parseInt(e.target.value)
                            )
                          }
                          placeholder="300"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="apply"
                checked={apply}
                onChange={(e) => setApply(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="apply"
                className="ml-2 block text-sm text-gray-900"
              >
                Apply changes (requires API key)
              </label>
            </div>

            {apply && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Warning
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      This will create CNAME records in your DNS. Make sure you
                      have a valid API key configured.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                apply
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              }`}
            >
              {loading
                ? apply
                  ? "Applying..."
                  : "Analyzing..."
                : apply
                ? "Create DKIM Records"
                : "Preview Changes"}
            </button>
          </form>
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
            {result.plan && !apply && (
              <FormCard title="DKIM Plan">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    The following CNAME records will be created:
                  </p>
                </div>
                <JsonBlock data={result.plan} title="Planned CNAME Records" />
              </FormCard>
            )}

            {result.changes && apply && (
              <FormCard title="Applied Changes">
                <div className="mb-4">
                  <p className="text-sm text-green-600">
                    ✅ Successfully created the following CNAME records:
                  </p>
                </div>
                <JsonBlock
                  data={result.changes}
                  title="CNAME Records Created"
                />
              </FormCard>
            )}

            {result.postcheck && apply && (
              <FormCard title="DNS Verification">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    DNS resolution verification for your DKIM selectors:
                  </p>
                </div>

                <div className="space-y-3">
                  {result.postcheck.map((check, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {check.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {check.resolves_to
                            ? `Resolves to: ${check.resolves_to}`
                            : "Not resolving"}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {check.ok ? (
                          <StatusBadge status="pass">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            OK
                          </StatusBadge>
                        ) : (
                          <StatusBadge status="fail">
                            <XCircle className="w-3 h-3 mr-1" />
                            Failed
                          </StatusBadge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </FormCard>
            )}

            {result.success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      {apply
                        ? "DKIM Records Created Successfully"
                        : "Analysis Complete"}
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      {apply
                        ? "Your DKIM CNAME records have been created. DNS propagation may take a few minutes."
                        : 'Review the plan above. Check "Apply changes" and resubmit to create the CNAME records.'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
