import { z } from "zod";
import { normalizePhone } from "@/lib/phone";

export const loginSchema = z.object({
  phone: z
    .string({ error: "Phone number is required" })
    .trim()
    .transform(normalizePhone)
    .pipe(z.string().regex(/^[0-9]{10}$/, "Phone number must be a valid 10-digit number")),
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required")
    .max(100, "Password is too long"),
});
