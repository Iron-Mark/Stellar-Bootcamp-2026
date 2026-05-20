import { DEFAULT_SAMPLE_PROOF_HASH } from "./demo-data.ts";

export const FALLBACK_PREVIEW_TITLE = "Pending Issuance";
export const DEMO_PREVIEW_TITLE = "Stellar Smart Contract Bootcamp Completion";

export function getCredentialTitleForPreviewState(
  recordTitle: string | null | undefined,
) {
  const title = recordTitle?.trim();
  return title || undefined;
}

export function getProofPreviewTitle({
  hash,
  credentialTitle,
}: {
  hash?: string;
  credentialTitle?: string;
}) {
  const realTitle = credentialTitle?.trim();
  if (realTitle) return realTitle;

  if (hash?.trim().toLowerCase() === DEFAULT_SAMPLE_PROOF_HASH.toLowerCase()) {
    return DEMO_PREVIEW_TITLE;
  }

  return FALLBACK_PREVIEW_TITLE;
}
