"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { ApiError, useApi } from "@/lib/api";
import { getDefaultDomain, saveDomain } from "@/lib/domain";
import { FormCard } from "@/components/FormCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/ToastHost";
import { CopyButton } from "@/components/CopyButton";

interface DomainConnectionStatus {
  domain: string;
  verification_record: string;
  dns_created: boolean;
  verification_status: string;
  estimated_completion: string;
  next_steps: string[];
  google_domain_id?: string;
}

interface VerificationResult {
  domain: string;
  verification_status: string;
  message: string;
  next_steps: string[];
}

export default function PostmasterConnectPage() {
  const { showToast } = useToast();
  const { apiFetch } = useApi();
  const [domain, setDomain] = useState(getDefaultDomain() || "");
  const [autoCreateDns, setAutoCreateDns] = useState(true);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<DomainConnectionStatus | null>(null);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setLoading(true);
    setError(null);
    setConnectionStatus(null);
    setVerificationResult(null);
    saveDomain(domain.trim());

    try {
      const response = await apiFetch("/postmaster/connect", {
        method: "POST",
        body: JSON.stringify({
          domain: domain.trim(),
          auto_create_dns: autoCreateDns,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || `HTTP ${response.status}`,
          response.status
        );
      }

      const result = await response.json();
      setConnectionStatus(result.data);

      if (result.data.verification_status === "verified") {
        showToast("Domain already connected!", "success");
      } else if (result.data.dns_created) {
        showToast("DNS verification record created automatically!", "success");
      } else {
        showToast("Verification record generated!", "success");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        showToast(err.message, "error");
      } else {
        const errorMessage = "Failed to connect domain";
        setError(errorMessage);
        showToast(errorMessage, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!domain.trim() || !connectionStatus) return;

    setVerifying(true);
    setError(null);

    try {
      const response = await apiFetch(
        `/postmaster/connect/${encodeURIComponent(domain.trim())}/verify`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || `HTTP ${response.status}`,
          response.status
        );
      }

      const result = await response.json();
      setVerificationResult(result.data);

      if (result.data.verification_status === "verified") {
        showToast("Domain successfully connected!", "success");
      } else {
        showToast("Verification still in progress", "success");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        showToast(err.message, "error");
      } else {
        const errorMessage = "Failed to verify domain";
        setError(errorMessage);
        showToast(errorMessage, "error");
      }
    } finally {
      setVerifying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "pass";
      case "pending":
        return "warn";
      case "failed":
        return "fail";
      default:
        return "idle";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center space-x-4">
          <Link
            href="/postmaster"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Postmaster
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Connect Domain to Postmaster
          </h1>
          <p className="mt-2 text-gray-600">
            Automatically connect your domain to Google Postmaster Tools for
            email deliverability monitoring
          </p>
        </div>

        {/* Connection Form */}
        <FormCard
          title="Connect Domain"
          subtitle="Enter your domain to start the connection process"
          className="mb-8"
        >
          <form onSubmit={handleConnect} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DNS Creation
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="autoCreateDns"
                    checked={autoCreateDns}
                    onChange={(e) => setAutoCreateDns(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="autoCreateDns"
                    className="text-sm text-gray-700"
                  >
                    Automatically create verification DNS record
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Requires Cloudflare API token. If disabled, you&apos;ll create
                  the DNS record manually.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Connecting..." : "Connect Domain"}
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

        {/* Connection Status */}
        {connectionStatus && (
          <div className="space-y-6">
            <FormCard title="Connection Status">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Domain:</span>
                  <span className="text-sm text-gray-900">
                    {connectionStatus.domain}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(connectionStatus.verification_status)}
                    <StatusBadge
                      status={getStatusColor(
                        connectionStatus.verification_status
                      )}
                    >
                      {connectionStatus.verification_status.toUpperCase()}
                    </StatusBadge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">DNS Record:</span>
                  <span className="text-sm text-gray-900">
                    {connectionStatus.dns_created
                      ? "Created automatically"
                      : "Manual creation required"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Estimated Completion:
                  </span>
                  <span className="text-sm text-gray-900">
                    {connectionStatus.estimated_completion}
                  </span>
                </div>
              </div>

              {/* Verification Record */}
              {connectionStatus.verification_record && (
                <div className="mt-6 p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Verification Record
                  </h4>
                  <div className="bg-white rounded-md p-3 relative">
                    <pre className="text-xs text-gray-900 whitespace-pre-wrap overflow-auto">
                      {connectionStatus.verification_record}
                    </pre>
                    <div className="absolute top-2 right-2">
                      <CopyButton
                        value={connectionStatus.verification_record}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Next Steps
                </h4>
                <ul className="space-y-2">
                  {connectionStatus.next_steps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-500 text-sm">•</span>
                      <span className="text-sm text-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Verify Button */}
              {connectionStatus.verification_status === "pending" && (
                <div className="mt-6">
                  <button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Connection"
                    )}
                  </button>
                </div>
              )}
            </FormCard>
          </div>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <FormCard title="Verification Result">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(verificationResult.verification_status)}
                  <StatusBadge
                    status={getStatusColor(
                      verificationResult.verification_status
                    )}
                  >
                    {verificationResult.verification_status.toUpperCase()}
                  </StatusBadge>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  {verificationResult.message}
                </p>
              </div>

              {verificationResult.next_steps.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Next Steps
                  </h4>
                  <ul className="space-y-2">
                    {verificationResult.next_steps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500 text-sm">•</span>
                        <span className="text-sm text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {verificationResult.verification_status === "verified" && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-800">
                      Domain successfully connected!
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    You can now pull metrics and view data in the Postmaster
                    dashboard.
                  </p>
                </div>
              )}
            </div>
          </FormCard>
        )}
      </div>
    </div>
  );
}
