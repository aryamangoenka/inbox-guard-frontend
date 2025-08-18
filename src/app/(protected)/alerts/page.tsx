"use client";

import { useEffect, useState, useCallback } from "react";
import { type AlertItem, formatPct } from "@/lib/alerts";
import { useApi } from "@/lib/api";

export default function AlertsPage() {
  const { apiFetch } = useApi();
  const [domain, setDomain] = useState<string>("");
  const [days, setDays] = useState<number>(30);
  const [items, setItems] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const qs = new URLSearchParams();
      if (domain) qs.set("domain", domain);
      qs.set("days", String(days));

      const response = await apiFetch(`/alerts/recent?${qs.toString()}`);
      if (!response.ok) {
        throw new Error(`alerts/recent ${response.status}`);
      }
      const data = await response.json();
      setItems(data?.data ?? []);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, [apiFetch, domain, days]);

  useEffect(() => {
    load();
  }, [load]); // initial load

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Alert History</h1>
          <p className="mt-2 text-gray-600">
            Monitor domain reputation and spam rate alerts across all your
            domains.
          </p>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm mb-8">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Domain
              </label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Leave empty for all domains"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>

            <button
              className="rounded-md bg-blue-600 text-white px-6 py-2 font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={load}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <div className="text-gray-500">Loading alerts...</div>
          </div>
        ) : err ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="text-red-700">{err}</div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <div className="text-gray-500">
              No alerts found for the selected filters.
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Alerts are generated when spam rates exceed 25% or domain
              reputation is LOW/BAD.
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-900">
                      Date
                    </th>
                    <th className="text-left p-4 font-medium text-gray-900">
                      Domain
                    </th>
                    <th className="text-left p-4 font-medium text-gray-900">
                      Spam Rate
                    </th>
                    <th className="text-left p-4 font-medium text-gray-900">
                      Reputation
                    </th>
                    <th className="text-left p-4 font-medium text-gray-900">
                      Severity
                    </th>
                    <th className="text-left p-4 font-medium text-gray-900">
                      Reason
                    </th>
                    <th className="text-left p-4 font-medium text-gray-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((a, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-900">{a.date}</td>
                      <td className="p-4">
                        <span className="font-medium text-gray-900">
                          {a.domain}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-medium ${
                            (a.spam_rate ?? 0) >= 0.3
                              ? "text-red-600"
                              : (a.spam_rate ?? 0) >= 0.25
                              ? "text-amber-600"
                              : "text-green-600"
                          }`}
                        >
                          {formatPct(a.spam_rate)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-medium ${
                            a.domain_reputation === "BAD"
                              ? "text-red-600"
                              : a.domain_reputation === "LOW"
                              ? "text-amber-600"
                              : "text-green-600"
                          }`}
                        >
                          {a.domain_reputation || "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            a.severity === "CRITICAL"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {a.severity}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{a.reason}</td>
                      <td className="p-4">
                        <a
                          href={`/postmaster?domain=${encodeURIComponent(
                            a.domain
                          )}&date=${encodeURIComponent(a.date)}`}
                          className="text-blue-600 hover:text-blue-800 underline font-medium"
                        >
                          View Details
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {items.length > 0 && (
              <div className="bg-gray-50 px-4 py-3 text-sm text-gray-500 border-t">
                Showing {items.length} alert{items.length !== 1 ? "s" : ""} from
                the last {days} days
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
