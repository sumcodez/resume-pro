import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter a name with at least 2 characters.")
    .max(60, "Enter a name with 60 characters or fewer."),
  email: z.email("Enter a valid email address.").transform((value) =>
    value.trim().toLowerCase()
  ),
  password: z
    .string()
    .min(8, "Use at least 8 characters for your password.")
    .max(100, "Use 100 characters or fewer for your password.")
    .regex(/[A-Z]/, "Include at least one uppercase letter.")
    .regex(/[a-z]/, "Include at least one lowercase letter.")
    .regex(/[0-9]/, "Include at least one number."),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").transform((value) =>
    value.trim().toLowerCase()
  ),
  password: z.string().min(1, "Enter your password."),
});

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter a name with at least 2 characters.")
    .max(60, "Enter a name with 60 characters or fewer."),
  email: z.email("Enter a valid email address.").transform((value) =>
    value.trim().toLowerCase()
  ),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
