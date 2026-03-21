import { z } from "zod";

// Loại ghế
export const seatTypeEnum = z.enum(["standard", "vip", "couple"]);

// Trạng thái đơn vé
export const bookingStatusEnum = z.enum([
  "pending",
  "confirmed",
  "cancelled",
  "failed",
  "refunded", // Thêm refunded để đồng bộ với Model
]);

// Ticket Item Schema - Vé chi tiết
export const ticketItemSchema = z.object({
  seat_code: z.string().min(1, "Seat code is required"),
  type: seatTypeEnum,
  price: z.number().min(0, "Ticket price must be >= 0"),
  isCheckIn: z.boolean().optional(),
  checkInAt: z.string().datetime().optional().nullable(),
});

// Create Booking Schema – Tạo đơn đặt vé
export const createBookingSchema = z.object({
  // THÊM: movie_id là bắt buộc
  movie_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid movie_id"),

  showtime_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid showtime_id"),

  total_amount: z.number().min(0, "Total amount must be >= 0"),

  status: z.enum(["pending", "confirmed", "paid", "cancelled"]).optional().default("pending"),

  tickets: z
    .array(ticketItemSchema)
    .min(1, "Booking must contain at least one ticket"),

  payment_method: z.string().min(1, "Payment method is required"),

  txnRef: z.string().optional(),

  // Thêm để Zod cho phép nhận các trường này nếu FE gửi lên
  locked_seats: z.array(z.string()).optional(),
  expires_at: z.string().datetime().optional().nullable(),
  qr_code_url: z.string().url().optional().nullable(),
});

// Update Booking Status - Cập nhật trạng thái đơn
export const updateBookingStatusSchema = z.object({
  status: bookingStatusEnum.optional(),
  isCheckIn: z.boolean().optional(),
  checkInAt: z.string().datetime().optional().nullable(),
});

// Query Params - Lọc danh sách booking
export const bookingQuerySchema = z.object({
  user_id: z.string().optional(),
  movie_id: z.string().optional(), // Thêm lọc theo phim
  showtime_id: z.string().optional(),
  status: bookingStatusEnum.optional(),
});

// GIỮ CHỖ (HOLD SEATS)
export const holdSeatsSchema = z.object({
  showtime_id: z.string().regex(/^[0-9a-fA-F]{24}$/),

  // THÊM: movie_id cho bước giữ chỗ
  movie_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid movie_id"),

  locked_seats: z
    .array(z.string().min(1))
    .min(1, "Must select at least one seat"),

  payment_method: z.string().min(1),
});

export const confirmBookingSchema = z.object({
  tickets: z.array(ticketItemSchema).min(1, "Must have at least one ticket"),
});