import mongoose from "mongoose";

const { Schema } = mongoose;

// ==============================
// TicketItem (vé chi tiết)
// ==============================
const ticketItemSchema = new Schema(
  {
    seat_code: { type: String, required: true },
    type: { type: String, enum: ["standard", "vip", "couple"], required: true },
    price: { type: Number, required: true, min: 0 },
    // THÊM: Để check-in từng ghế (nếu cần)
    isCheckIn: { type: Boolean, default: false },
    checkInAt: { type: Date, default: null },
  },
  { _id: false },
);

// ==============================
// Booking Schema (Đơn đặt vé)
// ==============================
const bookingSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    showtime_id: { type: Schema.Types.ObjectId, ref: "Showtime", required: true }, // Nên có ref
    booking_date: { type: Date, default: Date.now },
    total_amount: { type: Number, required: true, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "failed"],
      default: "pending",
      index: true,
    },
    tickets: { type: [ticketItemSchema], default: [] },
    locked_seats: { type: [String], default: [] },
    expires_at: { type: Date, index: true },
    txnRef: { type: String, index: true },
    payment_method: { type: String, required: true },
    
    // --- CÁC TRƯỜNG QUAN TRỌNG ĐỂ HOÀN THÀNH CHECK-IN ---
    isCheckIn: { 
      type: Boolean, 
      default: false 
    },
    checkInAt: { 
      type: Date, 
      default: null 
    },
    // --------------------------------------------------

    qr_code_url: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index(
  { showtime_id: 1, status: 1, "tickets.seat_code": 1 },
  { name: "seat_booking_index" },
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;