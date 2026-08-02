import { z } from "zod";

export const createExpenseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters.")
    .max(100, "Title cannot exceed 100 characters."),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters.")
    .optional()
    .default(""),

  amount: z
    .number({
      error: "Amount is required.",
    })
    .positive("Amount must be greater than zero."),

  type: z.enum(["income", "expense"]),

  date: z.coerce.date(),

  category: z.string().min(1, "Category is required."),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;