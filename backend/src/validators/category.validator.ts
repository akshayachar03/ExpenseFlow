import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must contain at least 2 characters.")
    .max(50, "Category name cannot exceed 50 characters."),

  color: z
    .string()
    .regex(
      /^#([A-Fa-f0-9]{6})$/,
      "Color must be a valid hexadecimal value."
    ),

  icon: z
    .string()
    .trim()
    .min(1, "Icon is required.")
    .max(50, "Icon cannot exceed 50 characters."),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;