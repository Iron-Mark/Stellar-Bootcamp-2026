import assert from "node:assert/strict";
import test from "node:test";
import { getProofMetadataForCertificate } from "./proof-metadata.ts";

test("proof metadata does not fetch issuer supplied URLs server-side", async () => {
  const originalFetch = globalThis.fetch;
  let called = false;

  globalThis.fetch = (async () => {
    called = true;
    throw new Error("server-side metadata fetch should not run");
  }) as typeof fetch;

  try {
    const metadata = await getProofMetadataForCertificate(
      "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
      {
        title: "Custom On-chain Credential Title",
        cohort: "Security Test Cohort",
        metadataUri: "https://example.com/proofs/meta.json",
      },
    );

    assert.equal(called, false);
    assert.equal(metadata?.title, "Custom On-chain Credential Title");
    assert.equal(metadata?.cohort, "Security Test Cohort");
    assert.deepEqual(metadata?.evidence, [
      {
        label: "Metadata source",
        href: "https://example.com/proofs/meta.json",
      },
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
