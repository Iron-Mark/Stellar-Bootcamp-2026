import assert from "node:assert/strict";
import test from "node:test";
import { validateFeeBumpRequestShape } from "./fee-bump-policy.ts";

test("fee bump policy rejects missing auth and oversized XDR before parsing", () => {
  assert.deepEqual(
    validateFeeBumpRequestShape({
      signedXdr: "AAAA",
      authorization: "",
      expectedToken: "secret",
      maxXdrLength: 12,
    }),
    { ok: false, status: 401, error: "Fee sponsorship requires server authorization." },
  );

  assert.deepEqual(
    validateFeeBumpRequestShape({
      signedXdr: "A".repeat(13),
      authorization: "Bearer secret",
      expectedToken: "secret",
      maxXdrLength: 12,
    }),
    { ok: false, status: 413, error: "Signed transaction is too large." },
  );
});

