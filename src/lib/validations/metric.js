import { z } from "zod";

export const createMetricSchema = z.object({
  userId: z
    .string({ error: "User ID is required" })
    .trim()
    .min(1, "User ID is required"),

  month: z
    .string({ error: "Month is required" })
    .trim()
    .min(1, "Month is required")
    .max(50, "Month is too long"),

  sales: z.coerce
    .number({ error: "Sales must be a valid number" })
    .finite("Sales must be a finite number")
    .min(0, "Sales must be 0 or greater")
    .max(1_000_000_000_000, "Sales value is too large"),

  expenses: z.coerce
    .number({ error: "Expenses must be a valid number" })
    .finite("Expenses must be a finite number")
    .min(0, "Expenses must be 0 or greater")
    .max(1_000_000_000_000, "Expenses value is too large"),

  profit: z.coerce
    .number()
    .finite("Profit must be a finite number")
    .min(-1_000_000_000_000, "Profit value is too small")
    .max(1_000_000_000_000, "Profit value is too large")
    .optional(),
});
