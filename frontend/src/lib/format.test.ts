import assert from "node:assert/strict";
import test from "node:test";
import { parseAmountToInt } from "./format.ts";

test("parseAmountToInt scales valid unsigned decimal input exactly", () => {
  assert.equal(parseAmountToInt("100", 2), 10000n);
  assert.equal(parseAmountToInt("0.01", 2), 1n);
  assert.equal(parseAmountToInt("1.2345678", 7), 12345678n);
});

test("parseAmountToInt rejects malformed or ambiguous decimal input", () => {
  for (const amount of ["", "0", "-0.1", "1.2.3", "1.-1", "1,000", "1abc"]) {
    assert.throws(
      () => parseAmountToInt(amount, 7),
      /amount|decimal|greater than zero/i,
    );
  }
});

