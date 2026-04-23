import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo Presentation",
  description:
    "Stellaroid Earn Demo Day presentation - on-chain credential trust for Stellar testnet. Top 5 / 105 in the Stellar PH Bootcamp 2026.",
  alternates: { canonical: "/slides" },
};

export default function SlidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
