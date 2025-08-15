"use client";

import Link from "next/link";
import {
  Shield,
  Key,
  CheckCircle,
  BarChart3,
  Settings,
  RefreshCw,
  AlertTriangle,
  Play,
  Pause,
  ArrowRight,
  Zap,
  Lock,
  TrendingUp,
  Users,
  Clock,
  Award,
} from "lucide-react";
import { useDomain } from "@/lib/domain";
import { useQuickStatus } from "@/hooks/useQuickStatus";
import { StatusBadge } from "@/components/StatusBadge";
import AlertsBell from "@/components/AlertsBell";

const features = [
  {
    icon: Shield,
    title: "DNS Security Check",
    description:
      "Automated SPF and DMARC compliance validation with detailed remediation guidance.",
    color: "bg-blue-500",
  },
  {
    icon: Zap,
    title: "Auto-Fix DNS Issues",
    description:
      "One-click resolution for common email authentication problems.",
    color: "bg-green-500",
  },
  {
    icon: Key,
    title: "DKIM Configuration",
    description:
      "Simplified DKIM selector setup with DNS verification and validation.",
    color: "bg-purple-500",
  },
  {
    icon: CheckCircle,
    title: "Pre-Send Validation",
    description: "RFC 8058 compliance checking before your emails are sent.",
    color: "bg-orange-500",
  },
  {
    icon: BarChart3,
    title: "Postmaster Insights",
    description: "Google Postmaster metrics and deliverability trend analysis.",
    color: "bg-indigo-500",
  },
  {
    icon: TrendingUp,
    title: "Real-time Monitoring",
    description:
      "Continuous monitoring of email authentication and deliverability status.",
    color: "bg-cyan-500",
  },
];

const stats = [
  { label: "Email Threats Blocked", value: "99.9%", icon: Lock },
  { label: "Setup Time", value: "<5 min", icon: Clock },
  { label: "False Positives", value: "<0.1%", icon: Award },
  { label: "Enterprise Clients", value: "500+", icon: Users },
];

const tools = [
  {
    title: "DNS Check",
    description: "Check SPF and DMARC compliance for your domain",
    href: "/dns/check",
    icon: Shield,
    color: "bg-blue-500",
  },
  {
    title: "DNS Autofix",
    description: "Automatically fix SPF and DMARC issues",
    href: "/dns/autofix",
    icon: Settings,
    color: "bg-green-500",
  },
  {
    title: "DKIM Setup",
    description: "Configure DKIM selectors for your domain",
    href: "/dns/dkim",
    icon: Key,
    color: "bg-purple-500",
  },
  {
    title: "Pre-send Check",
    description: "Validate email headers before sending",
    href: "/presend/check",
    icon: CheckCircle,
    color: "bg-orange-500",
  },
  {
    title: "Postmaster Tools",
    description: "View Google Postmaster metrics and trends",
    href: "/postmaster",
    icon: BarChart3,
    color: "bg-indigo-500",
  },
];

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

export default function LandingPage() {
  const { domain, setDomain } = useDomain();
  const {
    status,
    refetch,
    isAutoRefresh,
    pauseAutoRefresh,
    resumeAutoRefresh,
  } = useQuickStatus(domain);

  if (!process.env.NEXT_PUBLIC_API_URL) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Setup Required
          </h1>
          <p className="text-gray-600 mb-4">
            Please set up your environment variables:
          </p>
          <div className="bg-gray-50 p-3 rounded-md text-left text-sm font-mono">
            NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
          </div>
        </div>
      </div>
    );
  }

  const getSpamRateStatus = (rate?: number) => {
    if (rate === undefined) return "idle";
    if (rate < 0.25) return "pass";
    if (rate < 0.3) return "warn";
    return "fail";
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-600 rounded-2xl p-3">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Email Security
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Simplified
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Enterprise-grade email authentication and deliverability
              management. Protect your domain from spoofing, improve inbox
              placement, and ensure compliance with industry standards.
            </p>

            {/* Quick Domain Check */}
            <div className="max-w-md mx-auto mb-12">
              <div className="flex items-center gap-3 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Enter your domain"
                  className="flex-1 px-0 py-0 border-0 text-lg focus:outline-none focus:ring-0 placeholder-gray-400"
                />
                <button
                  onClick={refetch}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Check Status
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <Icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Status Dashboard */}
      {domain && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
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
                    onClick={
                      isAutoRefresh ? pauseAutoRefresh : resumeAutoRefresh
                    }
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
                      <StatusBadge
                        status={status.api.data.ok ? "pass" : "fail"}
                      >
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
                        <StatusBadge status={status.dns.data.spfStatus}>
                          {status.dns.data.dmarcValid &&
                          status.dns.data.spfStatus === "pass"
                            ? "Pass"
                            : "Issues"}
                        </StatusBadge>
                        <div className="text-xs text-gray-500 mt-1">
                          {status.dns.data.lookupCount} DNS lookups
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
                            ? `${(
                                status.postmaster.data?.spamRate * 100
                              ).toFixed(2)}%`
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
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Complete Email Security Suite
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to secure your email infrastructure and
              maintain perfect deliverability across all major email providers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
                >
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.color} mb-6`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Tools at Your Fingertips
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access our comprehensive suite of email security tools designed
              for IT professionals and security teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group block bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-200 hover:border-blue-200"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div
                      className={`p-3 rounded-xl ${tool.color} group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {tool.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {tool.description}
                  </p>
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Secure Your Email Infrastructure?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of organizations that trust Inbox Guard to protect
            their email reputation and ensure perfect deliverability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dns/check"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg"
            >
              Start Free Assessment
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
            <Link
              href="/postmaster"
              className="inline-flex items-center px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
