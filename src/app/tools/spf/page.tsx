"use client";

import { useState } from "react";
import { countSpfLookups, getSpfTone, getSpfGuidance } from "@/lib/spf";

export default function SpfToolPage() {
  const [txt, setTxt] = useState("");
  const count = txt.trim() ? countSpfLookups(txt) : 0;
  const tone = getSpfTone(count);
  const guidance = getSpfGuidance(count);

  const colorClasses = {
    green: "text-green-700 bg-green-100",
    amber: "text-amber-700 bg-amber-100",
    red: "text-red-700 bg-red-100",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          SPF Lookup Counter
        </h2>
        <p className="text-gray-600">
          SPF records are limited to 10 DNS lookups. Paste your SPF TXT record
          below to count include, redirect, a, mx, exists, and ptr mechanisms.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="spf-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            SPF TXT Record
          </label>
          <textarea
            id="spf-input"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            rows={6}
            value={txt}
            onChange={(e) => setTxt(e.target.value)}
            placeholder="v=spf1 include:_spf.google.com include:mailgun.org a mx ~all"
          />
        </div>

        {txt.trim() && (
          <div className="space-y-4">
            <div className={`rounded-lg p-4 ${colorClasses[tone]}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold">
                  DNS Lookups: {count}/10
                </span>
                <span className="text-sm font-medium">{guidance}</span>
              </div>
              <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    tone === "green"
                      ? "bg-green-600"
                      : tone === "amber"
                      ? "bg-amber-600"
                      : "bg-red-600"
                  }`}
                  style={{ width: `${Math.min(100, (count / 10) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Mechanisms Found:
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                {getMechanismBreakdown(txt).map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.type}</span>
                    <span className="font-mono">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                💡 Optimization Tips:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Consolidate multiple includes from the same provider</li>
                <li>• Use IP addresses instead of mechanisms when possible</li>
                <li>• Remove unused mechanisms (a, mx if not needed)</li>
                <li>• Consider flattening SPF records for complex setups</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getMechanismBreakdown(
  spf: string
): Array<{ type: string; count: number }> {
  const lower = spf.toLowerCase();
  const breakdown = [];

  const mechanisms = [
    { type: "include:", pattern: /include:/g },
    { type: "redirect=", pattern: /redirect=/g },
    { type: "a:", pattern: /a:/g },
    { type: "mx:", pattern: /mx:/g },
    { type: "exists:", pattern: /exists:/g },
    { type: "ptr:", pattern: /ptr:/g },
  ];

  for (const mech of mechanisms) {
    const matches = lower.match(mech.pattern);
    if (matches) {
      breakdown.push({ type: mech.type, count: matches.length });
    }
  }

  // Standalone mechanisms
  if (/\ba\b(?!:)/.test(lower))
    breakdown.push({ type: "a (standalone)", count: 1 });
  if (/\bmx\b(?!:)/.test(lower))
    breakdown.push({ type: "mx (standalone)", count: 1 });
  if (/\bptr\b(?!:)/.test(lower))
    breakdown.push({ type: "ptr (standalone)", count: 1 });

  return breakdown;
}
