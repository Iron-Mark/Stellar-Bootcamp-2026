import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/react";
import { ToastProvider } from "@/components/ui";
import { JsonLd } from "@/components/ui/json-ld";
import "../styles/globals.css";

const BASE_URL = "https://stellaroid-earn-demo.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Stellaroid Earn",
    template: "%s — Stellaroid Earn",
  },
  description:
    "Stellaroid Earn links proof and payment on Stellar so teams can check the record and pay with confidence.",
  alternates: {
    canonical: BASE_URL,
  },
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    apple: [{ url: "/logo.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Stellaroid Earn",
    description:
      "Check the record and pay with confidence on Stellar.",
    locale: "en_US",
    alternateLocale: "tl_PH",
    // Dynamic PNG rendered by src/app/opengraph-image.tsx — renders reliably on
    // Facebook, iMessage, WhatsApp, Telegram, LinkedIn, X, Slack, Discord.
  },
  twitter: {
    card: "summary_large_image",
    title: "Stellaroid Earn",
    description:
      "Check the record and pay with confidence on Stellar.",
  },
};

const webAppJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Stellaroid Earn",
    url: BASE_URL,
    description:
      "Stellaroid Earn links proof and payment on Stellar for certificates, completed work, and milestone approvals.",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Stellaroid Earn",
    url: BASE_URL,
  },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("stellaroid:locale")?.value === "tl" ? "tl" : "en";

  return (
    <html lang={lang}>
      <body suppressHydrationWarning>
        {webAppJsonLd.map((schema, i) => (
          <JsonLd key={i} data={schema} />
        ))}
        <ToastProvider>
          {children}
          <Analytics />
        </ToastProvider>
      </body>
    </html>
  );
}
