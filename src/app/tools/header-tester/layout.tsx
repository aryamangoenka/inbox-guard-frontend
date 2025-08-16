import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Header Tester (RFC 8058) — Inbox Guard",
  description:
    "Validate your List-Unsubscribe and One-Click headers for compliance.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/tools/header-tester`,
  },
  openGraph: {
    title: "Email Header Tester (RFC 8058) — Inbox Guard",
    description:
      "Validate your List-Unsubscribe and One-Click headers for compliance.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/tools/header-tester`,
    siteName: "Inbox Guard",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/og-tools-header.png`],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Email Header Tester (RFC 8058) — Inbox Guard",
    description:
      "Validate your List-Unsubscribe and One-Click headers for compliance.",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/og-tools-header.png`],
  },
};

export default function HeaderTesterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
