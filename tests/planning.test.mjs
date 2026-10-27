import assert from "node:assert/strict";
import test from "node:test";
import { createStarterPlan } from "../lib/planning.ts";
import { planningTasksSchema } from "../lib/profile-schema.ts";

const profile = {
  businessStatus: "planning",
  businessCategory: "retail",
  availableBudget: 50000,
  experienceLevel: "beginner",
};

test("creates a localized, incomplete starter checklist", () => {
  const plan = createStarterPlan(profile, "hi");

  assert.equal(plan.length, 4);
  assert.deepEqual(
    plan.map(({ id }) => id),
    ["talk-to-customers", "check-category-costs", "review-experience", "plan-the-budget"],
  );
  assert.ok(plan.every(({ completed }) => !completed));
  assert.match(plan[0].title, /संभावित ग्राहकों/);
});

test("rejects duplicate IDs in persisted plan updates", () => {
  const result = planningTasksSchema.safeParse([
    { id: "same-task", title: "Talk to customers", completed: false },
    { id: "same-task", title: "Review costs", completed: false },
  ]);

  assert.equal(result.success, false);
});
