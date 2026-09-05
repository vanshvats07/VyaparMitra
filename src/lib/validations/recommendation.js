import { z } from "zod";

export const recommendationRequestSchema = z.object({
  userId: z.string().trim().min(1, "User ID is required"),
});

export const recommendationResponseSchema = z.object({
  recommendations: z
    .array(
      z.object({
        title: z.string().trim().min(1),
        description: z.string().trim().min(1),
        reason: z.string().trim().min(1),
        priority: z.enum(["high", "medium", "low"]),
      })
    )
    .min(1)
    .max(6),
});