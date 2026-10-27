import assert from "node:assert/strict";
import test from "node:test";
import { formatBudget } from "../lib/format-budget.ts";

test("formats Indian rupees using Indian digit grouping", () => {
  assert.equal(formatBudget(125000), "₹1,25,000");
});

test("formats zero without fractional digits", () => {
  assert.equal(formatBudget(0), "₹0");
});

test("rejects negative or non-finite budgets", () => {
  for (const amount of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => formatBudget(amount), RangeError);
  }
});
