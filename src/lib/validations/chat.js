import { z } from "zod";

export const chatRequestSchema = z.object({
  userId: z
    .string({ error: "User ID is required" })
    .trim()
    .min(1, "User ID is required"),
  message: z
    .string({ error: "Message is required" })
    .trim()
    .min(1, "Message is required")
    .max(2000, "Message is too long (max 2000 characters)"),
});