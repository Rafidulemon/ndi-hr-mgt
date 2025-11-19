import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  employeeId: z.string().min(3, "Employee ID is required"),
  department: z.string().min(2, "Department is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  designation: z.string().min(2, "Designation is required"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  profilePhotoUrl: z
    .string()
    .url("Profile photo must be a valid URL")
    .max(2048, "Profile photo URL is too long")
    .optional()
    .nullable(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const sendResetPasswordLinkSchema = z.object({
  email: z.string().email({ message: "A valid email is required" }),
});

export type SendResetPasswordLinkInput = z.infer<typeof sendResetPasswordLinkSchema>;

export const updateUserPasswordSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type UpdateUserPasswordInput = z.infer<typeof updateUserPasswordSchema>;

export const tokenValidationSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export type TokenValidationInput = z.infer<typeof tokenValidationSchema>;

export const trialStatusSchema = z.object({
  email: z.string().email({ message: "A valid email is required" }),
});

export type TrialStatusInput = z.infer<typeof trialStatusSchema>;

export const AuthZodSchema = {
  userEmailParams: sendResetPasswordLinkSchema,
  userPasswordUpdateParams: updateUserPasswordSchema,
  userRegistrationParams: registerSchema,
};
