import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spam Rate Explainer — Inbox Guard",
  description:
    "Paste CSV or JSON to understand Gmail spam-rate thresholds (0.25/0.3) and risk level.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/tools/spam-explainer`,
  },
  openGraph: {
    title: "Spam Rate Explainer — Inbox Guard",
    description:
      "Paste CSV or JSON to understand Gmail spam-rate thresholds (0.25/0.3) and risk level.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/tools/spam-explainer`,
    siteName: "Inbox Guard",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/og-tools-spam.png`],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spam Rate Explainer — Inbox Guard",
    description:
      "Paste CSV or JSON to understand Gmail spam-rate thresholds (0.25/0.3) and risk level.",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/og-tools-spam.png`],
  },
};

export default function SpamExplainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
