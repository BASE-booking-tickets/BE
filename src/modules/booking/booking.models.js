import mongoose from "mongoose";

const { Schema } = mongoose;

// ==============================
// TicketItem (vé chi tiết)
// ==============================
const ticketItemSchema = new Schema(
  {
    seat_code: {
      type: String,
      required: true, // "A1"
    },
    type: {
      type: String,
      enum: ["standard", "vip", "couple"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

// ==============================
// Booking Schema (Đơn đặt vé)
// ==============================
const bookingSchema = new Schema(
  {
    // Người đặt vé
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Suất chiếu
    showtime_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    // Ngày tạo booking
    booking_date: {
      type: Date,
      default: Date.now,
    },

    // Tổng tiền
    total_amount: {
      type: Number,
      required: true,
      default: 0, // ✅ giữ ghế chưa có tiền
      min: 0,
    },

    // Trạng thái đơn
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "failed"],
      default: "pending",
      index: true,
    },

    // Danh sách vé (snapshot tại thời điểm mua)
    tickets: {
      type: [ticketItemSchema],
      // required: true,
      // validate: [
      //   (val) => val.length > 0,
      //   "Booking must contain at least one ticket",
      // ],
      default: [],
    },

    // 👉 Danh sách ghế đang bị giữ (phục vụ check trùng nhanh)
    locked_seats: {
      type: [String], // ["A1", "A2"]
      default: [],
    },

    // 👉 Thời gian hết hạn giữ ghế
    expires_at: {
      type: Date,
      index: true,
    },

    // Phương thức thanh toán
    payment_method: {
      type: String,
      required: true, // "Momo", "ZaloPay"
    },

    // QR Code (sau khi thanh toán thành công)
    qr_code_url: {
      type: String,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

// ==============================
// Index tối ưu check ghế
// ==============================
bookingSchema.index(
  { showtime_id: 1, status: 1, "tickets.seat_code": 1 },
  { name: "seat_booking_index" },
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
