"use client";

import { RefreshCw, Play, Pause } from "lucide-react";
import { useDomain } from "@/lib/domain";
import { useQuickStatus } from "@/hooks/useQuickStatus";
import { StatusBadge } from "@/components/StatusBadge";
import AlertsBell from "@/components/AlertsBell";

function QuickStatusTile({
  title,
  loading,
  error,
  data,
  lastUpdated,
}: {
  title: string;
  loading: boolean;
  error?: string;
  data?: React.ReactNode;
  lastUpdated?: number;
}) {
  if (loading) {
    return (
      <div className="text-center">
        <div className="mb-2 flex justify-center">
          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="h-4 w-20 bg-gray-200 rounded mx-auto mb-1 animate-pulse"></div>
        <div className="text-xs text-gray-500">{title}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="mb-2 flex justify-center">
          <StatusBadge status="fail">Error</StatusBadge>
        </div>
        <div
          className="text-sm font-medium text-gray-900 truncate"
          title={error}
        >
          {error.length > 20 ? `${error.substring(0, 20)}...` : error}
        </div>
        <div className="text-xs text-gray-500 mt-1">{title}</div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-2">{data}</div>
      {lastUpdated && (
        <div className="text-xs text-gray-400 mb-1">
          {new Date(lastUpdated).toLocaleTimeString()}
        </div>
      )}
      <div className="text-xs text-gray-500">{title}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { domain, setDomain } = useDomain();
  const {
    status,
    refetch,
    isAutoRefresh,
    pauseAutoRefresh,
    resumeAutoRefresh,
  } = useQuickStatus(domain);

  const getSpamRateStatus = (rate?: number) => {
    if (rate === undefined) return "idle";
    if (rate < 0.25) return "pass";
    if (rate < 0.3) return "warn";
    return "fail";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor your domain&apos;s email security and deliverability status
          </p>
        </div>

        {/* Domain Input */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="max-w-md">
            <label
              htmlFor="domain"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Domain to Monitor
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter your domain (e.g., example.com)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={refetch}
                disabled={!domain}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Check Status
              </button>
            </div>
          </div>
        </div>

        {/* Domain Health Overview */}
        {domain && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Domain Health Overview
                </h2>
                <p className="text-gray-600 mt-1">
                  Real-time status for {domain}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isAutoRefresh ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-500">
                    {isAutoRefresh ? "Auto-refresh on" : "Auto-refresh off"}
                  </span>
                </div>
                <button
                  onClick={refetch}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
                <button
                  onClick={isAutoRefresh ? pauseAutoRefresh : resumeAutoRefresh}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isAutoRefresh
                      ? "bg-green-50 text-green-700 hover:bg-green-100"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {isAutoRefresh ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </>
                  )}
                </button>
                <AlertsBell domain={domain} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <QuickStatusTile
                title="API Status"
                loading={status.api.loading}
                error={status.api.error}
                data={
                  status.api.data && (
                    <StatusBadge status={status.api.data.ok ? "pass" : "fail"}>
                      {status.api.data.ok ? "Online" : "Offline"}
                    </StatusBadge>
                  )
                }
                lastUpdated={status.api.lastUpdated}
              />

              <QuickStatusTile
                title="DNS Health"
                loading={status.dns.loading}
                error={status.dns.error}
                data={
                  status.dns.data && (
                    <div>
                      <StatusBadge
                        status={
                          status.dns.data.spfStatus === "pass" &&
                          status.dns.data.dmarcValid
                            ? "pass"
                            : "fail"
                        }
                      >
                        {status.dns.data.spfStatus === "pass" &&
                        status.dns.data.dmarcValid
                          ? "Configured"
                          : "Issues Found"}
                      </StatusBadge>
                      <div className="text-xs text-gray-500 mt-1">
                        SPF: {status.dns.data.spfStatus === "pass" ? "✓" : "✗"}{" "}
                        | DMARC: {status.dns.data.dmarcValid ? "✓" : "✗"}
                      </div>
                    </div>
                  )
                }
                lastUpdated={status.dns.lastUpdated}
              />

              <QuickStatusTile
                title="DKIM Status"
                loading={status.dkim.loading}
                error={status.dkim.error}
                data={
                  status.dkim.data && (
                    <div>
                      <StatusBadge
                        status={status.dkim.data.found ? "pass" : "fail"}
                      >
                        {status.dkim.data.found ? "Configured" : "Missing"}
                      </StatusBadge>
                      {status.dkim.data.target && (
                        <div
                          className="text-xs text-gray-500 mt-1 truncate"
                          title={status.dkim.data.target}
                        >
                          {status.dkim.data.target.length > 20
                            ? `${status.dkim.data.target.substring(0, 20)}...`
                            : status.dkim.data.target}
                        </div>
                      )}
                    </div>
                  )
                }
                lastUpdated={status.dkim.lastUpdated}
              />

              <QuickStatusTile
                title="Spam Rate"
                loading={status.postmaster.loading}
                error={status.postmaster.error}
                data={
                  status.postmaster.data ? (
                    <div>
                      <StatusBadge
                        status={
                          getSpamRateStatus(
                            status.postmaster.data?.spamRate
                          ) as "pass" | "warn" | "fail" | "idle"
                        }
                      >
                        {status.postmaster.data?.spamRate !== undefined
                          ? `${(status.postmaster.data?.spamRate * 100).toFixed(
                              2
                            )}%`
                          : "No data"}
                      </StatusBadge>
                      {status.postmaster.data?.reputation && (
                        <div className="text-xs text-gray-500 mt-1">
                          {status.postmaster.data?.reputation}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500">No data</div>
                  )
                }
                lastUpdated={status.postmaster.lastUpdated}
              />
            </div>
          </div>
        )}

        {/* Getting Started */}
        {!domain && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Get Started
              </h2>
              <p className="text-gray-600 mb-6">
                Enter your domain above to start monitoring your email security
                and deliverability status.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-2xl mb-2">🛡️</div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    DNS Security
                  </h3>
                  <p className="text-sm text-gray-600">
                    Check SPF and DMARC configuration
                  </p>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-2xl mb-2">📧</div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Email Health
                  </h3>
                  <p className="text-sm text-gray-600">
                    Monitor deliverability metrics
                  </p>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-2xl mb-2">🔔</div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Real-time Alerts
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get notified of issues instantly
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
