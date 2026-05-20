import { DEFAULT_SAMPLE_PROOF_HASH } from "@/lib/demo-data";
import type { ProofMetadata } from "@/lib/types";
import type { CertificateRecord } from "@/lib/contract-read-server";
import {
  isSafeExternalHttpUrl,
  sanitizeProofMetadata,
} from "@/lib/security";

const PROOF_METADATA: Record<string, ProofMetadata> = {
  [DEFAULT_SAMPLE_PROOF_HASH.toLowerCase()]: {
    title: "Stellar Smart Contract Bootcamp Completion",
    description:
      "Awarded after shipping a working Soroban contract, deploying it to Stellar testnet, and demoing the full register, verify, and pay flow through Freighter.",
    cohort: "Stellar PH Bootcamp 2026",
    criteria:
      "Complete the assigned Soroban contract, pass the test suite, deploy to Stellar testnet, connect the dApp to Freighter, and present an end-to-end verified badge demo.",
    skills: [
      "Soroban smart contracts",
      "Stellar testnet deployment",
      "Freighter wallet integration",
      "Next.js dApp frontend",
      "On-chain credential verification",
    ],
    evidence: [
      {
        label: "About the demo",
        href: "/about",
      },
      {
        label: "Launch the app flow",
        href: "/app",
      },
      {
        label: "Bootcamp contract verified badge",
        href: "https://stellar.expert/explorer/testnet/contract/CA7P5EPYKC2IW4PCMAH6NRBLHH3WP7AN6WWC3QDRWO4HLE47FAGO6TET",
      },
    ],
  },
};

export function getProofMetadata(hash: string): ProofMetadata | null {
  const key = hash.trim().toLowerCase();
  return PROOF_METADATA[key] ?? null;
}

async function fetchMetadataFromUri(uri: string): Promise<ProofMetadata | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(uri, {
      next: { revalidate: 3600 },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const length = Number(res.headers.get("content-length") ?? "0");
    if (length > 64 * 1024) return null;
    const text = await res.text();
    if (text.length > 64 * 1024) return null;
    return sanitizeProofMetadata(JSON.parse(text));
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getProofMetadataForCertificate(
  hash: string,
  cert: Pick<CertificateRecord, "title" | "cohort" | "metadataUri"> | null,
): Promise<ProofMetadata | null> {
  if (!cert) return null;

  const fallback = getProofMetadata(hash);
  const uri = cert.metadataUri.trim();

  // Prefer live metadata fetched from the on-chain URI.
  if (uri && isSafeExternalHttpUrl(uri)) {
    const remote = await fetchMetadataFromUri(uri);
    if (remote) return remote;
  }

  // Fall back: merge on-chain fields with the hardcoded demo map.
  const contractEvidence = uri && isSafeExternalHttpUrl(uri) ? [{ label: "Metadata source", href: uri }] : [];
  const title = cert.title.trim() || fallback?.title;
  const description = fallback?.description;

  if (!title && !description && !fallback && contractEvidence.length === 0) {
    return null;
  }

  return sanitizeProofMetadata({
    title: title ?? "On-chain credential",
    description:
      description ??
      "This credential is anchored on Stellar and carries contract-backed title, issuer, and status data.",
    cohort: cert.cohort.trim() || fallback?.cohort,
    criteria: fallback?.criteria,
    skills: fallback?.skills ?? [],
    evidence: [...contractEvidence, ...(fallback?.evidence ?? [])],
  });
}
