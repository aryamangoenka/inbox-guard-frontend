import Link from "next/link";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Free Email Tools
            </h1>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← Back to Dashboard
            </Link>
          </div>
          <p className="text-gray-600">
            Professional email security and deliverability tools - completely
            free to use.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/tools/spf"
            className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              SPF Lookup Counter
            </h3>
            <p className="text-sm text-gray-600">
              Count DNS lookups in your SPF record to stay within the 10-lookup
              limit.
            </p>
          </Link>

          <Link
            href="/tools/header-tester"
            className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              RFC 8058 Header Tester
            </h3>
            <p className="text-sm text-gray-600">
              Validate One-Click unsubscribe headers for compliance with RFC
              8058.
            </p>
          </Link>

          <Link
            href="/tools/spam-explainer"
            className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Spam Rate Explainer
            </h3>
            <p className="text-sm text-gray-600">
              Understand spam rate thresholds and get recommendations for
              improvement.
            </p>
          </Link>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
