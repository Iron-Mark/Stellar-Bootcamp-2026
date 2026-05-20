import type { CertificateStatus } from "./types";

type ProofClaimCert = { status: CertificateStatus } | null;

function shortHash(hash: string) {
  return hash.length > 20 ? `${hash.slice(0, 10)}...${hash.slice(-10)}` : hash;
}

export function proofCanMakeVerifiedClaims(cert: ProofClaimCert) {
  return cert?.status === "verified";
}

export function getProofSocialMetadata(hash: string, cert: ProofClaimCert) {
  const short = shortHash(hash);
  if (proofCanMakeVerifiedClaims(cert)) {
    return {
      title: `Verified Proof of Work - ${short}`,
      description:
        "Verified on-chain proof of completed work. Anchored on Stellar with SHA-256. Payment settled only when shown by contract state.",
    };
  }

  const state = cert ? cert.status : "not found";
  return {
    title: `Proof Lookup - ${short}`,
    description: `Credential status: ${state}. Open the proof page to inspect current on-chain state before trusting or sharing this record.`,
  };
}

export function getProofShareCopy(hash: string, url: string, cert: ProofClaimCert) {
  const verified = proofCanMakeVerifiedClaims(cert);
  const text = verified
    ? `I just got verified proof of work, on-chain, on @StellarOrg.

Hash: ${hash}

Proof: ${url}

#Stellar #Soroban #ProofOfWork`
    : `Credential proof lookup on Stellar.

Current status: ${cert?.status ?? "not found"}
Hash: ${hash}

Proof: ${url}

Verify the on-chain status before trusting this record.`;

  return { text, verified };
}
