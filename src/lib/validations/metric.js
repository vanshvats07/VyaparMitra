import { z } from "zod";

export const createMetricSchema = z.object({
  userId: z
    .string({ error: "User ID is required" })
    .trim()
    .min(1, "User ID is required"),

  month: z
    .string({ error: "Month is required" })
    .trim()
    .min(1, "Month is required"),

  sales: z.coerce
    .number({ error: "Sales must be a valid number" })
    .min(0, "Sales must be 0 or greater"),

  expenses: z.coerce
    .number({ error: "Expenses must be a valid number" })
    .min(0, "Expenses must be 0 or greater"),

  profit: z.coerce
    .number()
    .optional(),
});
