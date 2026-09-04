import { z } from "zod";

/**
 * Zod validation schema for AI Business Guide queries.
 */
export const aiGuideSchema = z.object({
  userId: z
    .string({ error: "User ID is required" })
    .trim()
    .min(1, "User ID is required"),

  question: z
    .string({ error: "Question is required" })
    .trim()
    .min(1, "Question is required")
    .max(2000, "Question is too long (max 2000 characters)"),
});
