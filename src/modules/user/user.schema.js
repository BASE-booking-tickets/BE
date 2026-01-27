import { z } from "zod";

// ==========================================
// 1. ENUMS
// ==========================================

// Quyền hạn người dùng
export const userRoleEnum = z.enum(["customer", "staff", "admin"]);

// ==========================================
// 2. SUB-SCHEMA
// ==========================================

// Phương thức thanh toán đã lưu
export const savedPaymentMethodSchema = z.object({
  type: z.string().min(1, "Loại thanh toán là bắt buộc"), // Visa, Momo
  last4: z.string().length(4, "last4 phải đúng 4 ký tự"), // 4242
  token: z.string().min(1, "Token là bắt buộc"),
});

// ==========================================
// 3. AUTH SCHEMAS
// ==========================================

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

// Logout User
export const logoutUserSchema = z.object({
  refresh_token: z.string().min(1, "Refresh token là bắt buộc"),
});

// ==========================================
// 4. USER PROFILE
// ==========================================

// Update User Profile (User tự cập nhật)
export const updateUserSchema = z
  .object({
    username: z.string().min(3).optional(),
    phone: z.string().optional(),
    avatar_url: z.string().url().optional(),
    saved_payment_methods: z.array(savedPaymentMethodSchema).optional(),
  })
  .strict(); // 🔥 chặn field dư

//đổi mật khẩu
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
  })
  .strict();

// ==========================================
// 5. ADMIN – USER MANAGEMENT
// ==========================================

// Admin: Update Roles
export const updateUserRoleSchema = z.object({
  roles: z.array(userRoleEnum).min(1, "Roles không được rỗng"),
});

// Admin: Update trạng thái user
export const updateUserStatusSchema = z.object({
  is_active: z.boolean().optional(),
  email_verified: z.boolean().optional(),
});

// Admin: Update full user (nâng cao)
export const adminUpdateUserSchema = z.object({
  username: z.string().min(3).optional(),
  phone: z.string().optional(),
  roles: z.array(userRoleEnum).optional(),
  is_active: z.boolean().optional(),
  email_verified: z.boolean().optional(),
});

// ==========================================
// 6. BOOKING / HISTORY
// ==========================================

// Gán booking vào user (sau khi đặt vé thành công)
export const addUserBookingSchema = z.object({
  booking_id: z.string().min(1, "Booking ID là bắt buộc"),
});

// Query lấy lịch sử vé
export const userBookingHistoryQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

// ==========================================
// 7. COMMON PARAM SCHEMA
// ==========================================

// Validate MongoDB ObjectId (dùng cho params)
export const objectIdSchema = z.object({
  id: z.string().min(1, "ID không hợp lệ"),
});
