import { buildFirstSteps } from "./recommendations.ts";
import type { ProfileInput, PlanningTask } from "./profile-schema.ts";

const STARTER_TASK_IDS = [
  "talk-to-customers",
  "check-category-costs",
  "review-experience",
  "plan-the-budget",
] as const;

type PlanningProfile = Pick<
  ProfileInput,
  "businessStatus" | "businessCategory" | "availableBudget" | "experienceLevel"
>;

export function createStarterPlan(
  profile: PlanningProfile,
  language: ProfileInput["preferredLanguage"],
): PlanningTask[] {
  const steps = buildFirstSteps(profile, language);
  if (steps.length !== STARTER_TASK_IDS.length) {
    throw new Error("Starter plan and recommendation counts do not match.");
  }

  return steps.map((title, index) => ({
    id: STARTER_TASK_IDS[index],
    title,
    completed: false,
  }));
}
