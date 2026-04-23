import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { TalentPassport } from "@/components/talent/talent-passport";
import { shortenAddress } from "@/lib/format";

const STELLAR_ADDRESS_RE = /^G[A-Z2-7]{55}$/;

interface PageProps {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { address } = await params;
  const short = shortenAddress(address, 6);
  return {
    title: `Talent · ${short} · Stellaroid Earn`,
    description: `Candidate passport for ${short} on Stellar testnet.`,
  };
}

export default async function TalentPage({ params }: PageProps) {
  const { address } = await params;
  if (!STELLAR_ADDRESS_RE.test(address)) notFound();

  // Note: Without a backend index, we cannot enumerate all credentials for an address.
  // This page serves as the passport shell — credentials are linked from proof pages.
  // Future: add an event-indexing layer to populate this automatically.

  return (
    <>
      <SiteNav />
      <main
        id="main"
        style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}
      >
        <TalentPassport address={address} issuer={null} credentials={[]} />
      </main>
      <SiteFooter />
    </>
  );
}
