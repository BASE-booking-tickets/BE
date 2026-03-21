import mongoose from "mongoose";

const { Schema } = mongoose;

// ==============================
// TicketItem (Chi tiết từng ghế trong đơn)
// ==============================
const ticketItemSchema = new Schema(
  {
    seat_code: { type: String, required: true },
    type: { type: String, enum: ["standard", "vip", "couple"], required: true },
    price: { type: Number, required: true, min: 0 },
    // Cho phép check-in lẻ từng người nếu đi nhóm nhưng vào cửa khác giờ nhau
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
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    
    // THAM CHIẾU ĐẾN MOVIE (Quan trọng để truy vấn lịch sử đặt vé theo phim)
    movie_id: { type: Schema.Types.ObjectId, ref: "Movie", required: true, index: true },
    
    showtime_id: { type: Schema.Types.ObjectId, ref: "Showtime", required: true, index: true },
    
    booking_date: { type: Date, default: Date.now },
    total_amount: { type: Number, required: true, default: 0, min: 0 },
    
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    tickets: { type: [ticketItemSchema], default: [] },
    
    // Danh sách seat_code để nhanh chóng kiểm tra ghế trống/đã đặt tại Showtime
    locked_seats: { type: [String], default: [] },
    
    // Thời gian hết hạn giữ ghế (thường là 5-10 phút để thanh toán)
    expires_at: { type: Date, index: true },
    
    // Thông tin thanh toán
    payment_method: { 
      type: String, 
      enum: ["vnpay", "momo", "zalo_pay", "stripe", "cash"], 
      required: true 
    },
    txnRef: { type: String, index: true, unique: true, sparse: true }, // Mã giao dịch từ cổng thanh toán
    
    // Trạng thái check-in tổng quát của cả đơn hàng
    isCheckIn: { 
      type: Boolean, 
      default: false 
    },
    checkInAt: { 
      type: Date, 
      default: null 
    },

    qr_code_url: { type: String }, // Lưu link ảnh QR để User quét tại rạp
  },
  { timestamps: true }
);

// Compound Index: Tối ưu cho việc kiểm tra ghế đã đặt của một suất chiếu cụ thể
bookingSchema.index(
  { showtime_id: 1, status: 1, "tickets.seat_code": 1 },
  { name: "seat_availability_idx" }
);

// Index: Hỗ trợ tìm kiếm lịch sử đặt vé của user theo thời gian giảm dần
bookingSchema.index({ user_id: 1, createdAt: -1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;