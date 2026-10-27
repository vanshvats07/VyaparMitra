import { z } from "zod";
import {
  indianStatesAndUnionTerritories,
  supportedLanguageCodes,
} from "./profile-options.ts";

export const businessCategories = [
  "agriculture",
  "food",
  "retail",
  "services",
  "manufacturing",
  "other",
] as const;

export const profileInputSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^(?:\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid Indian mobile number."),
    state: z.enum(indianStatesAndUnionTerritories),
    district: z.string().trim().min(2).max(80),
    village: z.string().trim().min(2).max(100),
    preferredLanguage: z.enum(supportedLanguageCodes),
    businessStatus: z.enum(["planning", "operating"]),
    businessIdea: z.string().trim().min(3).max(160),
    businessCategory: z.enum(businessCategories),
    availableBudget: z.coerce
      .number()
      .int()
      .positive()
      .max(Number.MAX_SAFE_INTEGER),
    experienceLevel: z.enum(["beginner", "some", "experienced"]),
  })
  .strict();

export type ProfileInput = z.infer<typeof profileInputSchema>;
