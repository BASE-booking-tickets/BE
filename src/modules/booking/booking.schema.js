import { z } from "zod";

// Loại ghế

export const seatTypeEnum = z.enum(["standard", "vip", "couple"]);

//Trạng thái đơn vé
export const bookingStatusEnum = z.enum([
  "pending",
  "confirmed",
  "cancelled",
  "failed",
]);

// Ticket Item Schema - Vé chi tiết
export const ticketItemSchema = z.object({
  seat_code: z.string().min(1, "Seat code is required"), // "A1"

  type: seatTypeEnum,

  price: z.number().min(0, "Ticket price must be greater than or equal to 0"),
});

// Create Booking Schema – Tạo đơn đặt vé
export const createBookingSchema = z.object({
  // user_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user_id"),

  showtime_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid showtime_id"),

  // booking_date: z.string().datetime().optional(), // nếu không truyền thì backend dùng Date.now

  total_amount: z.number().min(0, "Total amount must be >= 0"),

  tickets: z
    .array(ticketItemSchema)
    .min(1, "Booking must contain at least one ticket"),

  payment_method: z.string().min(1, "Payment method is required"),

  //  thêm cho giữ chỗ
  // locked_seats: z.array(z.string()).optional(),

  //  backend tự set khi giữ chỗ
  // expires_at: z.string().datetime().optional(),

  qr_code_url: z.string().url().optional(),
});

// Update Booking Status - Cập nhật trạng thái đơn
export const updateBookingStatusSchema = z.object({
  status: bookingStatusEnum,
});

// Query Params - Lọc danh sách booking
export const bookingQuerySchema = z.object({
  user_id: z.string().optional(),
  showtime_id: z.string().optional(),
  status: bookingStatusEnum.optional(),
});

//GIỮ CHỖ
export const holdSeatsSchema = z.object({
  // user_id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  showtime_id: z.string().regex(/^[0-9a-fA-F]{24}$/),

  locked_seats: z
    .array(z.string().min(1))
    .min(1, "Must select at least one seat"),

  payment_method: z.string().min(1),
});

export const confirmBookingSchema = z.object({
  tickets: z.array(ticketItemSchema).min(1, "Must have at least one ticket"),
});
