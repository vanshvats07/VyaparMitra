import assert from "node:assert/strict";
import test from "node:test";
import { buildFirstSteps } from "../lib/recommendations.ts";

const profile = {
  businessStatus: "planning",
  businessCategory: "food",
  availableBudget: 125000,
  experienceLevel: "beginner",
};

test("builds stable, profile-specific first steps", () => {
  const firstRun = buildFirstSteps(profile, "en");
  const secondRun = buildFirstSteps(profile, "en");

  assert.deepEqual(firstRun, secondRun);
  assert.equal(firstRun.length, 4);
  assert.match(firstRun[1], /products/);
  assert.match(firstRun[3], /₹1,25,000/);
});

test("adapts guidance to operating status, experience, and Hindi preference", () => {
  const steps = buildFirstSteps(
    {
      ...profile,
      businessStatus: "operating",
      businessCategory: "agriculture",
      experienceLevel: "experienced",
    },
    "hi",
  );

  assert.match(steps[0], /मौजूदा ग्राहकों/);
  assert.match(steps[1], /खेती/);
  assert.match(steps[2], /पुराने व्यवसाय/);
});
