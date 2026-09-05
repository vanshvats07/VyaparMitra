import { z } from "zod";

export const insightsRequestSchema = z.object({
  userId: z.string().trim().min(1, "User ID is required"),
});

const insightListSchema = z
  .array(z.string().trim().min(1).max(500))
  .max(5);

export const insightsResponseSchema = z.object({
  summary: z.string().trim().min(1).max(1000),
  opportunities: insightListSchema,
  risks: insightListSchema,
  nextSteps: insightListSchema,
});