import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free SPF Checker — Inbox Guard",
  description:
    "Check your SPF record for lookup limits, flattening issues, and deliverability risks.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/tools/spf` },
  openGraph: {
    title: "Free SPF Checker — Inbox Guard",
    description:
      "Check your SPF record for lookup limits, flattening issues, and deliverability risks.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/tools/spf`,
    siteName: "Inbox Guard",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/og-tools-spf.png`],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free SPF Checker — Inbox Guard",
    description:
      "Check your SPF record for lookup limits, flattening issues, and deliverability risks.",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/og-tools-spf.png`],
  },
};

export default function SpfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
