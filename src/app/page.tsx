import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  Key,
  CheckCircle,
  BarChart3,
  Settings,
  ArrowRight,
  Zap,
  Lock,
  TrendingUp,
  Users,
  Clock,
  Award,
} from "lucide-react";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://theinboxguard.com";

// SEO metadata for landing page
export const metadata: Metadata = {
  title: "Inbox Guard — Keep Emails Out of Spam",
  description:
    "Automated SPF, DKIM, DMARC fixes for Shopify & Klaviyo senders. Free tools to check SPF lookups, unsubscribe headers, and spam rates.",
  openGraph: {
    title: "Inbox Guard — Keep Emails Out of Spam",
    description:
      "Automated SPF, DKIM, DMARC fixes for Shopify & Klaviyo senders. Free tools to check SPF lookups, unsubscribe headers, and spam rates.",
    url: "/",
    siteName: "Inbox Guard",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inbox Guard — Keep Emails Out of Spam",
    description:
      "Automated SPF, DKIM, DMARC fixes for Shopify & Klaviyo senders. Free tools to check SPF lookups, unsubscribe headers, and spam rates.",
    images: ["/og-image.png"],
  },
};

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
  { icon: Lock, value: "99.9%", label: "Email Threats Blocked" },
  { icon: Clock, value: "<5 min", label: "Setup Time" },
  { icon: Award, value: "<0.1%", label: "False Positives" },
  { icon: Users, value: "500+", label: "Enterprise Clients" },
];

const tools = [
  {
    icon: Shield,
    title: "DNS Check",
    description: "Check SPF and DMARC compliance for your domain",
    href: "/dns/check",
    color: "bg-blue-500",
  },
  {
    icon: Settings,
    title: "DNS Autofix",
    description: "Automatically fix SPF and DMARC issues",
    href: "/dns/autofix",
    color: "bg-green-500",
  },
  {
    icon: Key,
    title: "DKIM Setup",
    description: "Configure DKIM selectors for your domain",
    href: "/dns/dkim",
    color: "bg-purple-500",
  },
  {
    icon: CheckCircle,
    title: "Pre-send Check",
    description: "Validate email headers before sending",
    href: "/presend/check",
    color: "bg-orange-500",
  },
  {
    icon: BarChart3,
    title: "Postmaster Tools",
    description: "View Google Postmaster metrics and trends",
    href: "/postmaster",
    color: "bg-indigo-500",
  },
];

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Inbox Guard",
            url: BASE_URL,
            potentialAction: {
              "@type": "SearchAction",
              target: `${BASE_URL}/tools/spf?domain={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
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

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
                <Link
                  href="/dns/check"
                  className="inline-flex items-center px-8 py-4 bg-transparent text-blue-600 border-2 border-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                >
                  Try DNS Check
                </Link>
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

        {/* Features Section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Complete Email Security Suite
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to secure your email infrastructure and
                maintain perfect deliverability across all major email
                providers.
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
                href="/dashboard"
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
    </>
  );
}
