import assert from "node:assert/strict";
import test from "node:test";
import { serializeJsonLd } from "./json-ld-safe.ts";

test("serializeJsonLd escapes HTML parser breakouts", () => {
  const serialized = serializeJsonLd({
    name: "</script><script>alert(document.domain)</script>",
    text: "<!-- comment -->",
  });

  assert.equal(serialized.includes("</script>"), false);
  assert.equal(serialized.includes("<!--"), false);
  assert.equal(serialized.includes("\\u003c/script\\u003e"), true);
});
