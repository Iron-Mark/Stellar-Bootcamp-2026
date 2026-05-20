import assert from "node:assert/strict";
import test from "node:test";
import {
  isE2EModeAllowed,
  isSafeExternalHttpUrl,
  isSafeInternalHref,
  sanitizeProofMetadata,
} from "./security.ts";

test("safe URL helpers reject script, data, localhost, and private-network URLs", () => {
  assert.equal(isSafeExternalHttpUrl("https://stellaroid.tech/proof"), true);
  assert.equal(isSafeExternalHttpUrl("javascript:alert(1)"), false);
  assert.equal(isSafeExternalHttpUrl("data:text/html,<script>x</script>"), false);
  assert.equal(isSafeExternalHttpUrl("http://localhost:3000"), false);
  assert.equal(isSafeExternalHttpUrl("https://127.0.0.1/meta.json"), false);
  assert.equal(isSafeExternalHttpUrl("https://10.0.0.3/meta.json"), false);

  assert.equal(isSafeInternalHref("/about"), true);
  assert.equal(isSafeInternalHref("proof/abc"), false);
  assert.equal(isSafeInternalHref("//evil.test/path"), false);
  assert.equal(isSafeInternalHref("/\\evil"), false);
});

test("sanitizeProofMetadata drops unsafe evidence links and bounds arrays", () => {
  const metadata = sanitizeProofMetadata({
    title: "  Credential  ",
    description: "Desc",
    skills: Array.from({ length: 20 }, (_, i) => `skill-${i}`),
    evidence: [
      { label: "safe internal", href: "/about" },
      { label: "safe external", href: "https://stellaroid.tech" },
      { label: "bad", href: "javascript:alert(1)" },
    ],
  });

  assert.equal(metadata?.title, "Credential");
  assert.equal(metadata?.skills.length, 12);
  assert.deepEqual(
    metadata?.evidence.map((item) => item.label),
    ["safe internal", "safe external"],
  );
});

test("E2E mode is only allowed in local test contexts", () => {
  assert.equal(isE2EModeAllowed({ nodeEnv: "test", ci: true }), true);
  assert.equal(isE2EModeAllowed({ nodeEnv: "development", playwright: true }), true);
  assert.equal(isE2EModeAllowed({ nodeEnv: "production", ci: true }), false);
  assert.equal(isE2EModeAllowed({ vercelEnv: "preview", ci: true }), false);
});

