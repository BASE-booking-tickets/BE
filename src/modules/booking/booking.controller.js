import Booking from "./booking.models.js";
import {
  bookingQuerySchema,
  confirmBookingSchema,
  createBookingSchema,
  holdSeatsSchema,
  updateBookingStatusSchema,
} from "./booking.schema.js";

// ==============================
// CREATE – Tạo đơn đặt vé
// ==============================
export const createBooking = async (req, res) => {
  try {
    // 1. Kiểm tra an toàn để tránh crash "reading id of undefined"
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!"
      });
    }

    // LẤY userId TỪ req.user ĐÃ ĐƯỢC MIDDLEWARE GIẢI MÃ
    const userId = req.user.id; 
    
    const { txnRef } = req.body; 

    // 2. Validate dữ liệu với Zod
    const data = createBookingSchema.parse(req.body);

    // 3. Kiểm tra tổng tiền
    const calculatedTotal = data.tickets.reduce(
      (sum, ticket) => sum + ticket.price,
      0,
    );

    if (calculatedTotal !== data.total_amount) {
      return res.status(400).json({
        success: false,
        message: "Tổng tiền không khớp với giá vé",
      });
    }

    // 4. Tạo Booking trong Database
    const booking = await Booking.create({
      ...data,
      user_id: userId, // Biến userId hiện đã được khai báo ở dòng 12
      txnRef: txnRef,
    });

    // 5. Trả về phản hồi thành công (Giúp Frontend chạy tiếp sang bước VNPay)
    return res.status(201).json({
      success: true,
      message: "Tạo đơn đặt vé thành công",
      data: booking,
    });

  } catch (error) {
    console.error("LỖI TẠO BOOKING:", error);

    // Xử lý lỗi Zod hoặc lỗi Database để không làm treo Frontend
    return res.status(400).json({
      success: false,
      message: error.errors?.[0]?.message || error.message || "Dữ liệu không hợp lệ",
    });
  }
};
// ==============================
// GET ALL – Lấy danh sách booking
// ==============================
export const getAllBookings = async (req, res) => {
  try {
    // Validate query params
    const query = bookingQuerySchema.parse(req.query);

    const bookings = await Booking.find(query)
      .populate("user_id", "username email")
      .populate("showtime_id")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách booking thành công",
      data: bookings,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.errors?.[0]?.message || error.message,
    });
  }
};

// ==============================
// GET BY ID – Lấy booking theo ID
// ==============================
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("user_id", "username email")
      .populate("showtime_id");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy booking",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy booking thành công",
      data: booking,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "ID booking không hợp lệ",
    });
  }
};

// ==============================
// UPDATE – Cập nhật trạng thái booking
// ==============================
// Trong booking.controller.js
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const data = updateBookingStatusSchema.parse(req.body);

    // Cập nhật và lấy bản ghi đã gộp dữ liệu (populate)
    const booking = await Booking.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    )
    .populate({
      path: 'showtime_id',
      populate: { path: 'movie_id', select: 'title' } // Lấy tên phim từ movie_id
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Không tìm thấy booking" });
    }

    return res.status(200).json({
      success: true,
      data: booking, // Dữ liệu này giờ đã có chi tiết phim và ghế
    });
  } catch (error) {
    // ... catch error
  }
};
// ==============================
// DELETE – Xóa booking
// ==============================
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy booking",
      });
    }

    // Không cho xóa nếu đã confirmed
    if (booking.status === "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa booking đã xác nhận",
      });
    }

    await booking.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Xóa booking thành công",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "ID booking không hợp lệ",
    });
  }
};

// giữ ghế
export const holdSeats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Validate body
    const data = holdSeatsSchema.parse(req.body);

    const { showtime_id, locked_seats, payment_method } = data;

    const now = new Date();

    // 2️⃣ Check ghế đã bị giữ / đặt chưa
    const conflictBooking = await Booking.findOne({
      showtime_id,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        { "tickets.seat_code": { $in: locked_seats } },
        { locked_seats: { $in: locked_seats } },
      ],
      $or: [
        { status: "confirmed" },
        { expires_at: { $gt: now } }, // pending chưa hết hạn
      ],
    });

    if (conflictBooking) {
      return res.status(409).json({
        success: false,
        message: "Một hoặc nhiều ghế đã được giữ hoặc đặt",
      });
    }

    // 3️⃣ Set thời gian hết hạn giữ ghế (VD: 5 phút)
    const HOLD_MINUTES = 5;
    const expiresAt = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);

    // 4️⃣ Tạo booking pending (chưa có tickets)
    const booking = await Booking.create({
      user_id: userId,
      showtime_id,
      status: "pending",
      locked_seats,
      expires_at: expiresAt,
      payment_method,
      total_amount: 0,
      tickets: [], // tạm thời
    });

    return res.status(201).json({
      success: true,
      message: "Giữ chỗ thành công",
      data: {
        booking_id: booking._id,
        expires_at: booking.expires_at,
        locked_seats: booking.locked_seats,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error?.errors?.[0]?.message || error.message || "Giữ chỗ thất bại",
    });
  }
};

export const confirmBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;

    const { tickets } = confirmBookingSchema.parse(req.body);

    // 1️⃣ Lấy booking đang pending
    const booking = await Booking.findOne({
      _id: bookingId,
      user_id: userId,
      status: "pending",
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking không tồn tại hoặc đã xử lý",
      });
    }

    // 2️⃣ Check hết hạn giữ ghế
    if (booking.expires_at && booking.expires_at < new Date()) {
      booking.status = "failed";
      await booking.save();

      return res.status(400).json({
        success: false,
        message: "Giữ ghế đã hết hạn",
      });
    }

    // 3️⃣ Check ghế có nằm trong locked_seats không
    const seatCodes = tickets.map((t) => t.seat_code);

    const invalidSeat = seatCodes.find(
      (seat) => !booking.locked_seats.includes(seat),
    );

    if (invalidSeat) {
      return res.status(400).json({
        success: false,
        message: `Ghế ${invalidSeat} không nằm trong danh sách giữ`,
      });
    }

    // 4️⃣ Tính tổng tiền
    const totalAmount = tickets.reduce((sum, t) => sum + t.price, 0);

    // 5️⃣ Update booking
    booking.tickets = tickets;
    booking.total_amount = totalAmount;
    booking.status = "confirmed";
    booking.locked_seats = [];
    booking.expires_at = null;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Thanh toán thành công",
      data: {
        booking_id: booking._id,
        total_amount: booking.total_amount,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error("CONFIRM BOOKING ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
