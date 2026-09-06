import { z } from "zod";
import { normalizePhone } from "@/lib/phone";

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
    .transform(normalizePhone)
    .pipe(z.string().regex(/^[0-9]{10}$/, "Phone number must be a valid 10-digit number")),

  state: z
    .string({ error: "State is required" })
    .trim()
    .min(1, "State is required")
    .max(100, "State is too long"),

  district: z
    .string({ error: "District is required" })
    .trim()
    .min(1, "District is required")
    .max(100, "District is too long"),

  village: z
    .string()
    .trim()
    .max(100, "Village is too long")
    .optional()
    .default(""),

  businessIdea: z
    .string({ error: "Business idea is required" })
    .trim()
    .min(1, "Business idea is required")
    .max(200, "Business idea is too long"),

  businessCategory: z
    .string({ error: "Business category is required" })
    .trim()
    .min(1, "Business category is required")
    .max(100, "Business category is too long"),

  budget: z.coerce
    .number({ error: "Budget must be a valid number" })
    .finite("Budget must be a finite number")
    .min(0, "Budget must be 0 or greater")
    .max(1_000_000_000, "Budget is too large"),

  experience: z
    .string({ error: "Experience level is required" })
    .trim()
    .min(1, "Experience level is required")
    .max(100, "Experience level is too long"),

  language: z
    .enum(["hi", "en"], {
      error: "Language must be either 'hi' or 'en'",
    })
    .default("en"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long")
    .optional(),

  confirmPassword: z.string().optional(),
}).superRefine((data, context) => {
  if (data.password && data.confirmPassword !== data.password) {
    context.addIssue({
      code: "custom",
      path: ["confirmPassword"],
      message: "Passwords do not match",
    });
  }
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
