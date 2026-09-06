import { z } from "zod";

const textField = (max, fallback = "") => z.string().trim().max(max).default(fallback);

export const localMarketRequestSchema = z.object({
  businessName: textField(200),
  businessCategory: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  district: z.string().trim().min(1).max(100),
  city: textField(100),
  budget: z.coerce.number().finite().min(0).max(1_000_000_000),
  targetCustomers: textField(500),
  experience: textField(100, "Not provided"),
  existingFinancialData: z.array(z.object({
    month: textField(50),
    sales: z.coerce.number().finite().min(0),
    expenses: z.coerce.number().finite().min(0),
    profit: z.coerce.number().finite(),
  })).max(24).default([]),
});
