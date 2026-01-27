import mongoose from "mongoose";

const { Schema } = mongoose;

// TicketItem (vé chi tiết)
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

// Booking Schema (Đơn đặt vé)
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
      //   ref: "Showtime",
      required: true,
    },

    booking_date: {
      type: Date,
      default: Date.now,
    },

    // Tổng tiền
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Trạng thái đơn
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "failed"],
      default: "pending",
    },

    // Danh sách vé (snapshot tại thời điểm mua)
    tickets: {
      type: [ticketItemSchema],
      required: true,
      validate: [
        (val) => val.length > 0,
        "Booking must contain at least one ticket",
      ],
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

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
