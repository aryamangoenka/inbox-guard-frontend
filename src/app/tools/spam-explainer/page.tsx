"use client";

import { useState } from "react";
import {
  spamRiskVerdict,
  getSpamRiskColor,
  getSpamRiskBgColor,
  getSpamRiskMessage,
  getSpamRiskRecommendations,
  formatSpamRate,
} from "@/lib/spam";

export default function SpamExplainerPage() {
  const [inputRate, setInputRate] = useState("");

  const rate = parseFloat(inputRate) / 100; // Convert percentage to decimal
  const isValidRate = !isNaN(rate) && rate >= 0 && rate <= 1;

  const verdict = isValidRate ? spamRiskVerdict(rate) : null;
  const message = verdict ? getSpamRiskMessage(verdict) : null;
  const recommendations = verdict ? getSpamRiskRecommendations(verdict) : [];

  const examples = [
    { rate: 0.05, label: "0.05% - Excellent" },
    { rate: 0.15, label: "0.15% - Good" },
    { rate: 0.25, label: "0.25% - Threshold" },
    { rate: 0.35, label: "0.35% - Critical" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Spam Rate Explainer",
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/tools/spam-explainer`,
            applicationCategory: "Utility",
            operatingSystem: "Any",
            provider: {
              "@type": "Organization",
              name: "Inbox Guard",
              url: process.env.NEXT_PUBLIC_BASE_URL,
            },
          }),
        }}
      />
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Spam Rate Explainer
          </h2>
          <p className="text-gray-600">
            Understanding spam rates and their impact on email deliverability.
            Enter a spam rate percentage to get detailed analysis and
            recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="rate-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Spam Rate (%)
              </label>
              <div className="relative">
                <input
                  id="rate-input"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={inputRate}
                  onChange={(e) => setInputRate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter spam rate (e.g., 2.5)"
                />
                <span className="absolute right-3 top-2 text-gray-500 text-sm">
                  %
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">
                Quick Examples:
              </div>
              <div className="grid grid-cols-2 gap-2">
                {examples.map((example, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setInputRate((example.rate * 100).toString())
                    }
                    className="text-left p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-sm font-medium">{example.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {isValidRate && verdict && (
              <div className={`rounded-lg p-4 ${getSpamRiskBgColor(verdict)}`}>
                <div
                  className={`text-lg font-semibold mb-2 ${getSpamRiskColor(
                    verdict
                  )}`}
                >
                  {formatSpamRate(rate)} - {verdict} RISK
                </div>
                <div className={`text-sm ${getSpamRiskColor(verdict)}`}>
                  {message}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                📊 Industry Thresholds:
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Low Risk</span>
                  <span className="text-sm font-medium text-green-600">
                    &lt; 0.25%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Elevated Risk</span>
                  <span className="text-sm font-medium text-amber-600">
                    0.25% - 0.30%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">High Risk</span>
                  <span className="text-sm font-medium text-red-600">
                    ≥ 0.30%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-3">
                🎯 What Affects Spam Rates:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Email content and subject lines</li>
                <li>• Sender reputation and domain history</li>
                <li>• List quality and acquisition methods</li>
                <li>• Engagement rates (opens, clicks)</li>
                <li>• Authentication setup (SPF, DKIM, DMARC)</li>
                <li>• Sending frequency and volume</li>
              </ul>
            </div>
          </div>
        </div>

        {isValidRate && recommendations.length > 0 && (
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              📝 Recommendations for {verdict} Risk ({formatSpamRate(rate)})
            </h3>
            <ul className="space-y-2">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-3 mt-0.5 text-blue-600">•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-amber-900 mb-2">
            📈 Monitoring Best Practices:
          </h3>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Track spam rates weekly using Google Postmaster Tools</li>
            <li>• Set up alerts for rates above 0.20% (early warning)</li>
            <li>• Monitor domain reputation alongside spam rates</li>
            <li>
              • Compare rates across different email types (transactional vs
              marketing)
            </li>
            <li>• Keep historical data to identify trends and patterns</li>
          </ul>
        </div>
      </div>
    </>
  );
}
