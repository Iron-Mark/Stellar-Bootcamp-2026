import assert from "node:assert/strict";
import test from "node:test";
import {
  getProofSocialMetadata,
  getProofShareCopy,
  proofCanMakeVerifiedClaims,
} from "./proof-claims.ts";
import type { CertificateStatus } from "./types.ts";

const hash = "c02ce1602d5bbb6ddfe93c6603d7f4e3dae3b2fb571ea4e70669ccd5a359aea3";

test("proofCanMakeVerifiedClaims only trusts verified certificates", () => {
  assert.equal(proofCanMakeVerifiedClaims({ status: "verified" }), true);
  for (const status of ["issued", "revoked", "suspended", "expired", "unknown"] as CertificateStatus[]) {
    assert.equal(proofCanMakeVerifiedClaims({ status }), false);
  }
  assert.equal(proofCanMakeVerifiedClaims(null), false);
});

test("social metadata does not claim arbitrary hashes are verified", () => {
  const missing = getProofSocialMetadata(hash, null);
  assert.equal(missing.title.includes("Verified"), false);
  assert.equal(missing.description.includes("Payment settled"), false);

  const verified = getProofSocialMetadata(hash, { status: "verified" });
  assert.equal(verified.title.includes("Verified"), true);
  assert.equal(verified.description.includes("Payment settled"), true);
});

test("share copy is neutral unless the proof is verified", () => {
  const issued = getProofShareCopy(hash, "https://example.test/proof", { status: "issued" });
  assert.equal(issued.text.includes("verified proof of work"), false);

  const verified = getProofShareCopy(hash, "https://example.test/proof", { status: "verified" });
  assert.equal(verified.text.includes("verified proof of work"), true);
});

