import z from "zod";

export const depositSchema = z.object({
  account_id: z.string().min(1, "Select an account"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Amount must be greater than 0",
    }),
  description: z.string().max(200).optional(),
});

export const withdrawSchema = z.object({
  account_id: z.string().min(1, "Select an account"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Amount must be greater than 0",
    }),
  description: z.string().max(200).optional(),
});

export const transferSchema = z
  .object({
    from_account_id: z.string().min(1, "Select source account"),
    to_account_id: z.string().min(1, "Select destination account"),
    amount: z
      .string()
      .min(1, "Amount is required")
      .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
        message: "Amount must be greater than 0",
      }),
    description: z.string().max(200).optional(),
  })
  .refine((data) => data.from_account_id !== data.to_account_id, {
    message: "Source and destination accounts must be different",
    path: ["to_account_id"],
  });
