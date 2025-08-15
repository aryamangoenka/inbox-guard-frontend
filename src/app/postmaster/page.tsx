"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { apiGet, apiPost, ApiError, getPostmasterMetrics } from "@/lib/api";
import { getDefaultDomain, saveDomain } from "@/lib/domain";
import { FormCard } from "@/components/FormCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/ToastHost";

interface PostmasterData {
  date: string;
  spam_rate?: number;
  domain_reputation?: string;
}

interface PostmasterResult {
  success: boolean;
  data: {
    summary: {
      domain: string;
      days_requested: number;
      records_fetched: number;
      records_stored: number;
      latest_date: string;
    };
    recent_records: PostmasterData[];
  };
}

interface LatestData {
  success: boolean;
  data: PostmasterData;
}

export default function PostmasterPage() {
  const { showToast } = useToast();
  const [domain, setDomain] = useState("");
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PostmasterResult | null>(null);
  const [latestData, setLatestData] = useState<LatestData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<PostmasterData[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const loadLatestData = useCallback(
    async (targetDomain?: string) => {
      const checkDomain = targetDomain || domain;
      if (!checkDomain) return;

      try {
        const latest = await apiGet<LatestData>("/postmaster/latest", {
          domain: checkDomain,
        });
        setLatestData(latest);
      } catch (err) {
        // Latest data is optional, don't show error
        console.warn("Failed to load latest postmaster data:", err);
      }
    },
    [domain]
  );

  const loadMetricsData = useCallback(
    async (targetDomain?: string, targetDays?: number) => {
      const checkDomain = targetDomain || domain;
      const checkDays = targetDays || days;
      if (!checkDomain) return;

      setMetricsLoading(true);
      setMetricsError(null);

      try {
        const metricsData = await getPostmasterMetrics(checkDomain, checkDays);
        setMetrics(metricsData);
      } catch (err) {
        if (err instanceof ApiError) {
          setMetricsError(err.message);
        } else {
          setMetricsError("Failed to load metrics data");
        }
        console.warn("Failed to load metrics data:", err);
      } finally {
        setMetricsLoading(false);
      }
    },
    [domain, days]
  );

  useEffect(() => {
    const defaultDomain = getDefaultDomain();
    setDomain(defaultDomain);
    // Load latest data and metrics on mount
    if (defaultDomain) {
      loadLatestData(defaultDomain);
      loadMetricsData(defaultDomain, days);
    }
  }, [loadLatestData, loadMetricsData, days]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    saveDomain(domain.trim());

    try {
      // Pull new data
      const pullResult = await apiPost<PostmasterResult>(
        "/postmaster/pull-daily",
        {
          domain: domain.trim(),
          days,
        },
        true // requireKey=true to send X-API-Key header
      );
      setResult(pullResult);

      // Show success toast
      showToast("Metrics pulled successfully!", "success");

      // Refresh latest data and metrics
      await Promise.all([
        loadLatestData(domain.trim()),
        loadMetricsData(domain.trim(), days),
      ]);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          const errorMessage =
            "Missing or invalid API key. Set NEXT_PUBLIC_API_KEY (or provide a key in settings).";
          setError(errorMessage);
          showToast(errorMessage, "error");
        } else {
          setError(err.message);
          showToast(err.message, "error");
        }
      } else {
        const errorMessage = "An unexpected error occurred";
        setError(errorMessage);
        showToast(errorMessage, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const getReputationScore = (reputation: string): number => {
    switch (reputation.toUpperCase()) {
      case "HIGH":
        return 3;
      case "MEDIUM":
        return 2;
      case "LOW":
        return 1;
      case "BAD":
        return 0;
      default:
        return 1;
    }
  };

  const getReputationLabel = (score: number): string => {
    switch (score) {
      case 3:
        return "HIGH";
      case 2:
        return "MEDIUM";
      case 1:
        return "LOW";
      case 0:
        return "BAD";
      default:
        return "UNKNOWN";
    }
  };

  const getSpamRateStatus = (rate: number) => {
    if (rate < 0.25) return "pass";
    if (rate < 0.3) return "warn";
    return "fail";
  };

  // Prepare chart data
  const chartData =
    metrics
      .map((record) => ({
        date: new Date(record.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        spam_rate: (record.spam_rate ?? 0) * 100, // Convert to percentage
        reputation_score: getReputationScore(
          record.domain_reputation ?? "UNKNOWN"
        ),
        reputation_label: record.domain_reputation ?? "UNKNOWN",
      }))
      .reverse() || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <h1 className="text-3xl font-bold text-gray-900">Postmaster Tools</h1>
          <p className="mt-2 text-gray-600">
            View Google Postmaster metrics and trends
          </p>
        </div>

        {/* Current Status */}
        {latestData && latestData.data && (
          <FormCard title="Current Status" className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {((latestData.data.spam_rate ?? 0) * 100).toFixed(2)}%
                </div>
                <div className="mb-2">
                  <StatusBadge
                    status={getSpamRateStatus(latestData.data.spam_rate ?? 0)}
                  >
                    Spam Rate
                  </StatusBadge>
                </div>
                <div className="text-xs text-gray-500">
                  Latest: {new Date(latestData.data.date).toLocaleDateString()}
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {latestData.data.domain_reputation}
                </div>
                <div className="mb-2">
                  <StatusBadge
                    status={
                      latestData.data.domain_reputation === "HIGH"
                        ? "pass"
                        : latestData.data.domain_reputation === "MEDIUM"
                        ? "warn"
                        : "fail"
                    }
                  >
                    Reputation
                  </StatusBadge>
                </div>
                <div className="text-xs text-gray-500">Domain Status</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {domain}
                </div>
                <div className="mb-2">
                  <StatusBadge status="idle">Monitoring</StatusBadge>
                </div>
                <div className="text-xs text-gray-500">Current Domain</div>
              </div>
            </div>
          </FormCard>
        )}

        <FormCard
          title="Pull Metrics"
          subtitle="Fetch recent Google Postmaster data for analysis"
          className="mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
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
                <label
                  htmlFor="days"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Days to Pull
                </label>
                <select
                  id="days"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Pulling Data..." : "Pull Metrics"}
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
          <div className="space-y-8">
            {/* Summary */}
            <FormCard title="Data Summary">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {result.data.summary.records_fetched}
                  </div>
                  <div className="text-xs text-gray-500">Records Fetched</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {result.data.summary.records_stored}
                  </div>
                  <div className="text-xs text-gray-500">Records Stored</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {result.data.summary.days_requested}
                  </div>
                  <div className="text-xs text-gray-500">Days Requested</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {new Date(
                      result.data.summary.latest_date
                    ).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">Latest Date</div>
                </div>
              </div>
            </FormCard>

            {/* Charts */}
            <FormCard title="Spam Rate Trend">
              <div className="h-80">
                {metricsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">Loading trend...</div>
                  </div>
                ) : metricsError ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <div className="text-red-500 text-center">
                      {metricsError}
                    </div>
                    <button
                      onClick={() => loadMetricsData(domain, days)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Retry
                    </button>
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <div>No trend data yet</div>
                      <div className="text-sm mt-1">
                        Try Pull Metrics, then refresh
                      </div>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis
                        domain={[0, 35]}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `${(value as number).toFixed(2)}%`,
                          "Spam Rate",
                        ]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <ReferenceLine
                        y={25}
                        stroke="#f59e0b"
                        strokeDasharray="5 5"
                        label="Warning (25%)"
                      />
                      <ReferenceLine
                        y={30}
                        stroke="#ef4444"
                        strokeDasharray="5 5"
                        label="Critical (30%)"
                      />
                      <Line
                        type="monotone"
                        dataKey="spam_rate"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        name="Spam Rate (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </FormCard>

            {/* Domain Reputation Chart */}
            <FormCard title="Domain Reputation Trend">
              <div className="h-80">
                {metricsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">Loading trend...</div>
                  </div>
                ) : metricsError ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <div className="text-red-500 text-center">
                      {metricsError}
                    </div>
                    <button
                      onClick={() => loadMetricsData(domain, days)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Retry
                    </button>
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <div>No trend data yet</div>
                      <div className="text-sm mt-1">
                        Try Pull Metrics, then refresh
                      </div>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis
                        domain={[0, 3]}
                        tickFormatter={(value) => getReputationLabel(value)}
                        ticks={[0, 1, 2, 3]}
                      />
                      <Tooltip
                        formatter={(value, name, props) => [
                          props.payload.reputation_label,
                          "Reputation",
                        ]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Line
                        type="stepAfter"
                        dataKey="reputation_score"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                        name="Domain Reputation"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </FormCard>
          </div>
        )}
      </div>
    </div>
  );
}
