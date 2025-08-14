"use client";

import { useState, useEffect } from "react";
import {
  XCircle,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Search,
} from "lucide-react";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { getDefaultDomain, saveDomain } from "@/lib/domain";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { JsonBlock } from "@/components/JsonBlock";
import { CopyButton } from "@/components/CopyButton";

interface DNSCheckResult {
  success: boolean;
  data: {
    spf: {
      exists: boolean;
      valid: boolean;
      lookup_count: number;
      status: "pass" | "warn" | "fail";
    };
    dmarc: {
      exists: boolean;
      valid: boolean;
      record: string | null;
    };
  };
}

interface AutofixResult {
  success: boolean;
  plan?: Array<{ action: string; reason: string }>;
  changes?: Array<{
    action: string;
    record_id: string;
    name: string;
    content: string;
  }>;
  postcheck?: {
    spf: {
      exists: boolean;
      valid: boolean;
      lookup_count: number;
      status: string;
    };
    dmarc: { exists: boolean; valid: boolean; record: string | null };
  };
}

function StatusCard({
  title,
  status,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  status: "pass" | "warn" | "fail" | "idle";
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  const statusConfig = {
    pass: "border-green-200 bg-green-50",
    warn: "border-yellow-200 bg-yellow-50",
    fail: "border-red-200 bg-red-50",
    idle: "border-gray-200 bg-gray-50",
  };

  return (
    <div
      className={`rounded-xl border-2 p-6 ${statusConfig[status]} ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <StatusBadge status={status} />
      </div>
      {children}
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  description,
  className = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-blue-900 mb-1">{title}</h4>
          <p className="text-sm text-blue-700">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function DNSCheckPage() {
  const [zoneRoot, setZoneRoot] = useState("");
  const [fqdn, setFqdn] = useState("");
  const [loading, setLoading] = useState(false);
  const [autofixLoading, setAutofixLoading] = useState(false);
  const [result, setResult] = useState<DNSCheckResult | null>(null);
  const [autofixResult, setAutofixResult] = useState<AutofixResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const defaultDomain = getDefaultDomain();
    setZoneRoot(defaultDomain);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneRoot.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setAutofixResult(null);
    saveDomain(zoneRoot.trim());

    try {
      const params: Record<string, string> = { zone_root: zoneRoot.trim() };
      if (fqdn.trim()) {
        params.fqdn = fqdn.trim();
      }

      const response = await apiGet<DNSCheckResult>("/dns/check", params);
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

  const handleAutofix = async (apply: boolean) => {
    if (!zoneRoot.trim()) return;

    setAutofixLoading(true);
    setError(null);

    try {
      const response = await apiPost<AutofixResult>(
        "/dns/autofix",
        { zone_root: zoneRoot.trim(), apply },
        apply // require API key for apply
      );
      setAutofixResult(response);

      // Refresh the DNS check after applying fixes
      if (apply && response.success) {
        // Refetch DNS data to show updated results
        try {
          const params: Record<string, string> = { zone_root: zoneRoot.trim() };
          if (fqdn.trim()) {
            params.fqdn = fqdn.trim();
          }
          const refreshedData = await apiGet<DNSCheckResult>(
            "/dns/check",
            params
          );
          setResult(refreshedData);
        } catch {
          // If refresh fails, keep existing results
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setAutofixLoading(false);
    }
  };

  const getOverallStatus = () => {
    if (!result) return "idle";
    const spfPass = result.data.spf.status === "pass";
    const dmarcPass = result.data.dmarc.exists && result.data.dmarc.valid;

    if (spfPass && dmarcPass) return "pass";
    if (result.data.spf.status === "warn" || (!spfPass && !dmarcPass))
      return "fail";
    return "warn";
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <PageHeader
          title="DNS Security Check"
          description="Verify your domain's SPF and DMARC configuration for optimal email security and deliverability."
          className="mb-12"
        />

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <InfoCard
            icon={Shield}
            title="SPF Protection"
            description="Sender Policy Framework prevents unauthorized servers from sending emails on behalf of your domain."
          />
          <InfoCard
            icon={CheckCircle}
            title="DMARC Authentication"
            description="Domain-based Message Authentication provides policy instructions for handling unauthenticated emails."
          />
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <SectionHeader
            title="Domain Configuration"
            description="Enter your domain details to check DNS records"
            className="mb-6"
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="zone_root"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Zone Root Domain *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="zone_root"
                    value={zoneRoot}
                    onChange={(e) => setZoneRoot(e.target.value)}
                    placeholder="example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="fqdn"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  FQDN (Optional)
                </label>
                <input
                  type="text"
                  id="fqdn"
                  value={fqdn}
                  onChange={(e) => setFqdn(e.target.value)}
                  placeholder="subdomain.example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Checking..." : "Check DNS Records"}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8 rounded-lg">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-8 mb-8">
            {/* Overall Status */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="text-center">
                <div className="mb-4">
                  {getOverallStatus() === "pass" ? (
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  ) : getOverallStatus() === "warn" ? (
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
                  ) : (
                    <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Overall DNS Security Status
                </h2>
                <StatusBadge
                  status={getOverallStatus()}
                  className="text-lg px-4 py-2"
                >
                  {getOverallStatus() === "pass"
                    ? "Secure"
                    : getOverallStatus() === "warn"
                    ? "Needs Attention"
                    : "Vulnerable"}
                </StatusBadge>
              </div>
            </div>

            {/* SPF Results */}
            <StatusCard
              title="SPF Configuration"
              status={result.data.spf.status}
              icon={Shield}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {result.data.spf.exists ? "✓" : "✗"}
                  </div>
                  <div className="text-sm text-gray-600">Record Exists</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {result.data.spf.valid ? "✓" : "✗"}
                  </div>
                  <div className="text-sm text-gray-600">Valid Syntax</div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold mb-1 ${
                      result.data.spf.lookup_count > 10
                        ? "text-red-600"
                        : result.data.spf.lookup_count > 8
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {result.data.spf.lookup_count}/10
                  </div>
                  <div className="text-sm text-gray-600">DNS Lookups</div>
                </div>
              </div>
            </StatusCard>

            {/* DMARC Results */}
            <StatusCard
              title="DMARC Configuration"
              status={
                result.data.dmarc.exists && result.data.dmarc.valid
                  ? "pass"
                  : "fail"
              }
              icon={CheckCircle}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {result.data.dmarc.exists ? "✓" : "✗"}
                    </div>
                    <div className="text-sm text-gray-600">Record Exists</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {result.data.dmarc.valid ? "✓" : "✗"}
                    </div>
                    <div className="text-sm text-gray-600">
                      Valid Configuration
                    </div>
                  </div>
                </div>

                {result.data.dmarc.record && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-gray-700">
                        DMARC Record
                      </div>
                      <CopyButton value={result.data.dmarc.record} />
                    </div>
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg font-mono text-sm break-all">
                      {result.data.dmarc.record}
                    </div>
                  </div>
                )}
              </div>
            </StatusCard>

            {/* Auto-Fix Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <SectionHeader
                title="Auto-Fix Options"
                description="Automatically resolve DNS configuration issues"
                className="mb-6"
              />

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAutofix(false)}
                    disabled={autofixLoading}
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    {autofixLoading ? "Analyzing..." : "Preview Fixes"}
                  </button>
                  <button
                    onClick={() => handleAutofix(true)}
                    disabled={autofixLoading}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {autofixLoading ? "Applying..." : "Apply Fixes"}
                  </button>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-amber-800">
                        <span className="font-medium">Important:</span> Apply
                        Fixes requires an API key and will make live DNS changes
                        to your domain. Always preview changes first.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Autofix Results */}
        {autofixResult && (
          <div className="space-y-6">
            {autofixResult.plan && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <SectionHeader title="Fix Plan" className="mb-6" />
                <JsonBlock data={autofixResult.plan} title="Planned Changes" />
              </div>
            )}

            {autofixResult.changes && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <SectionHeader title="Applied Changes" className="mb-6" />
                <JsonBlock
                  data={autofixResult.changes}
                  title="DNS Changes Made"
                />
              </div>
            )}

            {autofixResult.postcheck && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <SectionHeader title="Post-Check Results" className="mb-6" />
                <JsonBlock
                  data={autofixResult.postcheck}
                  title="Updated DNS Status"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
