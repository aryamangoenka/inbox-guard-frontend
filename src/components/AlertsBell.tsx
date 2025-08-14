"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchRecentAlerts, type AlertItem, formatPct } from "@/lib/alerts";

function useLocalBadge() {
  const key = "alerts.read.timestamps";
  const [readMap, setReadMap] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(readMap));
  }, [readMap]);

  return { readMap, setReadMap };
}

export default function AlertsBell({ domain }: { domain?: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const { readMap, setReadMap } = useLocalBadge();

  useEffect(() => {
    setLoading(true);
    fetchRecentAlerts(domain, 30)
      .then(setItems)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [domain]);

  const unreadCount = useMemo(() => {
    let count = 0;
    for (const a of items.slice(0, 10)) {
      const id = `${a.domain}:${a.date}:${a.severity}`;
      if (!readMap[id]) count++;
    }
    return count;
  }, [items, readMap]);

  function markAllRead() {
    const now = Date.now();
    const next = { ...readMap };
    for (const a of items.slice(0, 10)) {
      next[`${a.domain}:${a.date}:${a.severity}`] = now;
    }
    setReadMap(next);
  }

  return (
    <div className="relative">
      <button
        className="relative rounded-lg border px-2 py-1 text-sm hover:bg-gray-50 transition-colors"
        onClick={() => {
          setOpen(!open);
          if (!open) markAllRead();
        }}
        title="Alerts"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-[10px] px-1 min-w-[16px] h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-96 max-h-96 overflow-auto rounded-xl border bg-white shadow-lg z-50">
            <div className="p-3 border-b text-sm font-semibold bg-gray-50">
              Recent Alerts
            </div>
            {loading ? (
              <div className="p-3 text-sm text-gray-500">Loading…</div>
            ) : err ? (
              <div className="p-3 text-sm text-red-600">{err}</div>
            ) : items.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">
                No alerts in the last 30 days.
              </div>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {items.slice(0, 10).map((a, i) => (
                  <li
                    key={i}
                    className="border-b last:border-b-0 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span
                        className={`font-medium ${
                          a.severity === "CRITICAL"
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      >
                        {a.severity}
                      </span>
                      <span className="text-gray-500">{a.date}</span>
                    </div>
                    <div className="text-sm mb-1">
                      <span className="font-medium">{a.domain}</span> · Spam{" "}
                      {formatPct(a.spam_rate)} · Rep{" "}
                      {a.domain_reputation || "—"}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">{a.reason}</div>
                    <a
                      href={`/postmaster?domain=${encodeURIComponent(
                        a.domain
                      )}&date=${encodeURIComponent(a.date)}`}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                      onClick={() => setOpen(false)}
                    >
                      View in dashboard →
                    </a>
                  </li>
                ))}
                {items.length > 10 && (
                  <li className="p-3 text-center">
                    <a
                      href="/alerts"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      View all alerts →
                    </a>
                  </li>
                )}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
