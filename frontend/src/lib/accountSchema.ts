import z from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(60, "Name too long"),
  currency: z.string().min(1, "Currency is required"),
});
