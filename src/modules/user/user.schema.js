import { z } from "zod";

// Enum
export const userRoleEnum = z.enum(["customer", "staff", "admin"]);

// Sub-schema: Saved Payment Method
export const savedPaymentMethodSchema = z.object({
  type: z.string().min(1, "Loại thanh toán là bắt buộc"), // Visa, Momo
  last4: z.string().length(4, "last4 phải đúng 4 ký tự"), // 4242
  token: z.string().min(1, "Token là bắt buộc"),
});

// Register User
export const registerUserSchema = z.object({
  username: z.string().min(3, "Username phải ít nhất 3 ký tự"),

  email: z.string().email("Email không hợp lệ"),

  password: z.string().min(6, "Password phải ít nhất 6 ký tự"),

  phone: z.string().optional(),
});

// Login User
export const loginUserSchema = z.object({
  email: z.string().email("Email không hợp lệ"),

  password: z.string().min(1, "Password là bắt buộc"),
});

// Update User Profile
export const updateUserSchema = z.object({
  username: z.string().min(3).optional(),

  phone: z.string().optional(),

  avatar_url: z.string().url().optional(),

  saved_payment_methods: z.array(savedPaymentMethodSchema).optional(),
});

// Admin: Update Roles
export const updateUserRoleSchema = z.object({
  roles: z.array(userRoleEnum).min(1),
});
