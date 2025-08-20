"use client";

import { useState, useEffect } from "react";
import {
  XCircle,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  Search,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { ApiError, useApi } from "@/lib/api";
import { getDefaultDomain, saveDomain } from "@/lib/domain";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
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
  const { apiFetch } = useApi();
  const [zoneRoot, setZoneRoot] = useState("");
  const [fqdn, setFqdn] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DNSCheckResult | null>(null);
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
    saveDomain(zoneRoot.trim());

    try {
      const params: Record<string, string> = { zone_root: zoneRoot.trim() };
      if (fqdn.trim()) {
        params.fqdn = fqdn.trim();
      }

      const searchParams = new URLSearchParams(params);
      const response = await apiFetch(`/dns/check?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = (await response.json()) as DNSCheckResult;
      setResult(result);
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
        {/* Back to Dashboard Link */}
        <div className="mb-8 flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <PageHeader
          title="DNS Security Check"
          description="Verify any public domain's SPF and DMARC configuration for optimal email security and deliverability."
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
            description="Enter any public domain to check DNS records"
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

            {/* Autofix Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <SectionHeader
                title="Need to Fix DNS Issues?"
                description="Use the DNS Autofix tool to automatically resolve configuration problems"
                className="mb-6"
              />

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Note:</span> DNS Autofix
                        requires a Cloudflare API key and will make live DNS
                        changes to your domain.
                        <Link
                          href="/dns/autofix"
                          className="ml-1 text-blue-600 hover:text-blue-800 underline"
                        >
                          Go to DNS Autofix →
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
