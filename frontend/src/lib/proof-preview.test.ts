import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_SAMPLE_PROOF_HASH } from "./demo-data.ts";
import {
  getCredentialTitleForPreviewState,
  getProofPreviewTitle,
} from "./proof-preview.ts";

test("proof preview title prefers real credential title for non-demo hashes", () => {
  const title = getProofPreviewTitle({
    hash: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    credentialTitle: "Custom On-chain Credential Title",
  });

  assert.equal(title, "Custom On-chain Credential Title");
});

test("proof preview title only uses static demo metadata when no real title is available", () => {
  assert.equal(
    getProofPreviewTitle({
      hash: DEFAULT_SAMPLE_PROOF_HASH,
      credentialTitle: "  ",
    }),
    "Stellar Smart Contract Bootcamp Completion",
  );
});

test("proof preview title is neutral when neither chain title nor demo metadata exists", () => {
  assert.equal(
    getProofPreviewTitle({
      hash: "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
    }),
    "Pending Issuance",
  );
});

test("proof preview state clears stale title when a new record title is blank", () => {
  assert.equal(
    getCredentialTitleForPreviewState("  ", "Prior Credential Title"),
    undefined,
  );
});
