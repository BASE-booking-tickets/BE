import { z } from "zod";

// Loại ghế

export const seatTypeEnum = z.enum(["standard", "vip", "couple"]);

//Trạng thái đơn vé
export const bookingStatusEnum = z.enum([
  "pending", // chờ thanh toán
  "confirmed", // đã thanh toán / thu tiền tại quầy
  "cancelled",
  "failed",
  "checked_in", // đã vào rạp
]);

//Ai là người đặt vé
export const bookedByEnum = z.enum(["customer", "staff"]);

// Ticket Item Schema - Vé chi tiết
export const ticketItemSchema = z.object({
  seat_code: z.string().min(1, "Seat code is required"), // "A1"

  type: seatTypeEnum,

  price: z.number().min(0, "Ticket price must be greater than or equal to 0"),
});

// Create Booking Schema – Tạo đơn đặt vé
export const createBookingSchema = z.object({
  user_id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  showtime_id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  tickets: z.array(ticketItemSchema).min(1),
  // total_amount: z.number().min(0),
  payment_method: z.string().min(1),
  qr_code_url: z.string().optional(),
});

// customer đặt online
export const customerBookingSchema = z.object({
  ...createBookingSchema.shape,
  booked_by: z.literal("customer"),
});

// staff đặt tại quầy
export const staffCreateBookingSchema = z.object({
  ...createBookingSchema.shape,
  booked_by: z.literal("staff"),
});

// Update Booking Status - Cập nhật trạng thái đơn
export const updateBookingStatusSchema = z.object({
  status: bookingStatusEnum.refine(
    (s) => s !== "checked_in",
    "Không dùng API này để check-in",
  ),
});

// CHECK-IN (STAFF)
export const checkInBookingSchema = z.object({
  booking_id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

// Query Params - Lọc danh sách booking
export const bookingQuerySchema = z.object({
  user_id: z.string().optional(),
  showtime_id: z.string().optional(),
  status: bookingStatusEnum.optional(),
  booked_by: bookedByEnum.optional(),
});
