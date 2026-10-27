import assert from "node:assert/strict";
import test from "node:test";
import { profileInputSchema } from "../lib/profile-schema.ts";

const validProfile = {
  fullName: "  Asha Devi ",
  phoneNumber: "+91 9876543210",
  state: "Rajasthan",
  district: "Jaipur",
  village: "Chomu",
  preferredLanguage: "hi",
  businessStatus: "planning",
  businessIdea: "A neighborhood tailoring service",
  businessCategory: "services",
  availableBudget: "125000",
  experienceLevel: "beginner",
};

test("validates and normalizes a completed business profile", () => {
  const result = profileInputSchema.parse(validProfile);

  assert.equal(result.fullName, "Asha Devi");
  assert.equal(result.availableBudget, 125000);
  assert.equal(result.preferredLanguage, "hi");
});

test("rejects incomplete or malformed contact and budget information", () => {
  const result = profileInputSchema.safeParse({
    ...validProfile,
    phoneNumber: "123",
    availableBudget: "-500",
  });

  assert.equal(result.success, false);
});

test("rejects unknown fields rather than silently accepting them", () => {
  const result = profileInputSchema.safeParse({
    ...validProfile,
    isAdmin: true,
  });

  assert.equal(result.success, false);
});
