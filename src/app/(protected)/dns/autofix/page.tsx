"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { type AutofixChange, ApiError, useApi } from "@/lib/api";
import { getDefaultDomain, saveDomain } from "@/lib/domain";
import { useToast } from "@/components/Toast";

function Badge({
  children,
  tone = "gray",
}: {
  children: React.ReactNode;
  tone?: "green" | "amber" | "red" | "gray";
}) {
  const colorMap: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${colorMap[tone]}`}
    >
      {children}
    </span>
  );
}

function DiffRow({ change }: { change: AutofixChange }) {
  const before = change.old_value ?? "—";
  const after = change.content ?? "—";
  const action = change.action || "CHANGE";
  const name = change.name || "";
  const type = change.type || "TXT";
  const tone = action.includes("CREATE")
    ? "green"
    : action.includes("DELETE")
    ? "red"
    : "amber";

  return (
    <div className="border rounded-lg p-3 mb-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge tone="gray">{type}</Badge>
        <span className="font-medium">{name}</span>
        <Badge tone={tone}>{action}</Badge>
      </div>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-gray-500 mb-1">Before</div>
          <pre className="bg-gray-50 rounded p-2 text-xs overflow-auto">
            {before}
          </pre>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">After</div>
          <pre className="bg-gray-50 rounded p-2 text-xs overflow-auto">
            {after}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function AutofixPage() {
  const { apiFetch } = useApi();
  const [zone, setZone] = useState("");
  const [planning, setPlanning] = useState(false);
  const [planErr, setPlanErr] = useState<string | null>(null);
  const [changes, setChanges] = useState<AutofixChange[] | null>(null);

  const [applying, setApplying] = useState(false);
  const [applyErr, setApplyErr] = useState<string | null>(null);

  const { setMsg, Toast } = useToast();

  useEffect(() => {
    const defaultDomain = getDefaultDomain();
    setZone(defaultDomain);
  }, []);

  async function runPlan() {
    if (!zone.trim()) return;

    setPlanning(true);
    setPlanErr(null);
    saveDomain(zone.trim());

    try {
      const response = await apiFetch("/dns/autofix", {
        method: "POST",
        body: JSON.stringify({ zone_root: zone.trim(), apply: false }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const res = await response.json();
      setChanges(res?.changes ?? []);
    } catch (e: unknown) {
      setPlanErr(e instanceof Error ? e.message : "Failed to plan changes");
    } finally {
      setPlanning(false);
    }
  }

  async function runApply() {
    if (!zone.trim()) return;

    setApplying(true);
    setApplyErr(null);

    try {
      const response = await apiFetch("/dns/autofix", {
        method: "POST",
        body: JSON.stringify({ zone_root: zone.trim(), apply: true }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const res = await response.json();
      setChanges(res?.changes ?? []);
      setMsg("Autofix applied successfully!");
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        setApplyErr(
          "Authentication required. Please log in to apply DNS changes."
        );
      } else {
        setApplyErr(e instanceof Error ? e.message : "Failed to apply changes");
      }
    } finally {
      setApplying(false);
    }
  }

  const idempotent = (changes?.length ?? 0) === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Toast />

        <div className="mb-8 flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">DNS Autofix</h1>
          <p className="mt-2 text-gray-600">
            Plan and apply DNS fixes with before/after preview
          </p>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm mb-8">
          <div className="mb-4 text-lg font-semibold text-gray-900">
            Domain Configuration
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="zone_root"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Zone Root Domain *
              </label>
              <input
                type="text"
                id="zone_root"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={runPlan}
                disabled={planning || !zone.trim()}
                className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {planning ? "Planning…" : "Plan Changes"}
              </button>

              <button
                onClick={runApply}
                disabled={applying || !changes || idempotent || !zone.trim()}
                className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  !changes
                    ? "Run plan first"
                    : idempotent
                    ? "No changes to apply"
                    : ""
                }
              >
                {applying ? "Applying…" : "Confirm & Apply"}
              </button>
            </div>

            {planErr && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-700">{planErr}</div>
              </div>
            )}

            {applyErr && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-700">{applyErr}</div>
              </div>
            )}

            {changes && changes.length === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="text-sm text-green-700">
                  No changes required (idempotent).
                </div>
              </div>
            )}
          </div>
        </div>

        {changes && changes.length > 0 && (
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Planned Changes
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Review the changes below, then click{" "}
                <strong>Confirm & Apply</strong> to implement them.
              </p>
            </div>

            <div className="space-y-3">
              {changes.map((change, i) => (
                <DiffRow key={i} change={change} />
              ))}
            </div>

            {!applying && (
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">
                      Important
                    </h3>
                    <div className="mt-2 text-sm text-amber-700">
                      Applying changes will make live DNS modifications to your
                      domain. Ensure you have a valid API key configured.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
