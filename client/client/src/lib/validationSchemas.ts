import { z } from "zod";

export const FIXED_CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Health",
  "Salary",
  "Shopping",
  "Entertainment",
  "Education",
  "Other",
] as const;

export type Category = typeof FIXED_CATEGORIES[number];

export const transactionSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1, { message: "Description is required" }),
  amount: z
    .number()
    .positive({ message: "Amount must be greater than zero" })
    .refine((val) => !isNaN(val), { message: "Amount cannot be NaN" })
    .refine((val) => isFinite(val), { message: "Amount must be finite" }),
  category: z.enum(FIXED_CATEGORIES).optional(),
  createdAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
});

export type ValidTransaction = z.infer<typeof transactionSchema>;

export const budgetSchema = z.object({
  monthlyBudget: z.number().positive({ message: "Budget must be a positive number" }),
});

export const accountNameSchema = z
  .string()
  .min(1, { message: "Account name is required" })
  .max(50, { message: "Account name is too long" })
  .transform((val) => val.trim());

export const profileSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(50),
  bio: z.string().max(200).optional(),
  currency: z.string().min(2).max(3),
  monthlyReminder: z.boolean(),
});

export const importDataSchema = z.object({
  profile: z.object({
    name: z.string().min(1),
    bio: z.string().optional(),
    currency: z.string().min(2).max(3),
    monthlyReminder: z.boolean().optional(),
  }).optional(),
  expenses: z.array(transactionSchema).default([]),
  revenues: z.array(transactionSchema).default([]),
  savings: z.array(transactionSchema).default([]),
  monthlyBudget: z.number().positive().optional(),
});

export type ImportData = z.infer<typeof importDataSchema>;

export function validateTransaction(data: unknown) {
  return transactionSchema.safeParse(data);
}

export function validateBudget(amount: unknown) {
  return budgetSchema.safeParse({ monthlyBudget: amount });
}

export function validateImportData(data: unknown) {
  return importDataSchema.safeParse(data);
}
