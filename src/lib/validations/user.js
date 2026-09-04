import { z } from "zod";

/**
 * Zod schema to validate user onboarding input.
 * Matches all fields from the VyaparMitra onboarding form.
 */
export const createUserSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, "Name is required"),

  phone: z
    .string({ error: "Phone number is required" })
    .trim()
    .regex(/^[0-9]{10}$/, "Phone number must be a valid 10-digit number"),

  state: z
    .string({ error: "State is required" })
    .trim()
    .min(1, "State is required"),

  district: z
    .string({ error: "District is required" })
    .trim()
    .min(1, "District is required"),

  village: z
    .string()
    .trim()
    .optional()
    .default(""),

  businessIdea: z
    .string({ error: "Business idea is required" })
    .trim()
    .min(1, "Business idea is required"),

  businessCategory: z
    .string({ error: "Business category is required" })
    .trim()
    .min(1, "Business category is required"),

  budget: z.coerce
    .number({ error: "Budget must be a valid number" })
    .min(0, "Budget must be 0 or greater"),

  experience: z
    .string({ error: "Experience level is required" })
    .trim()
    .min(1, "Experience level is required"),

  language: z
    .enum(["hi", "en"], {
      error: "Language must be either 'hi' or 'en'",
    })
    .default("en"),
});

/**
 * Helper to turn Zod error issues into a clean, field-keyed object.
 * Example: { name: "Name is required", phone: "Phone number must be a valid 10-digit number" }
 */
export function formatZodErrors(zodError) {
  const errors = {};
  for (const issue of zodError.issues) {
    const field = issue.path.join(".") || "general";
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}
