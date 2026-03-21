import Booking from "./booking.models.js";
import {
  bookingQuerySchema,
  confirmBookingSchema,
  createBookingSchema,
  holdSeatsSchema,
  updateBookingStatusSchema,
} from "./booking.schema.js";

// ==============================
// CREATE – Tạo đơn đặt vé trực tiếp
// ==============================
export const createBooking = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!"
      });
    }

    const userId = req.user.id;
    const { txnRef } = req.body;

    // Validate dữ liệu với Zod (Đảm bảo schema đã có movie_id)
    const data = createBookingSchema.parse(req.body);

    // Kiểm tra tổng tiền từ danh sách vé gửi lên
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

    // Tạo Booking trong Database
    const booking = await Booking.create({
      ...data,
      user_id: userId,
      movie_id: data.movie_id, // Đã thêm movie_id
      txnRef: txnRef,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo đơn đặt vé thành công",
      data: booking,
    });

  } catch (error) {
    console.error("LỖI TẠO BOOKING:", error);
    return res.status(400).json({
      success: false,
      message: error.errors?.[0]?.message || error.message || "Dữ liệu không hợp lệ",
    });
  }
};

// ==============================
// GET ALL – Lấy danh sách booking
// ==============================
// ==============================
// GET ALL – Lấy danh sách booking (Có hỗ trợ lọc theo Movie)
// ==============================
export const getAllBookings = async (req, res) => {
  try {
    const queryData = bookingQuerySchema.parse(req.query);
    const filter = {};

    // Nếu truyền movie_id, chỉ lấy đơn hàng của phim đó
    if (queryData.movie_id) {
      filter.movie_id = queryData.movie_id;
    }

    // Nếu truyền showtime_id (Dùng cho trang chọn ghế), lọc cực kỳ chính xác
    if (queryData.showtime_id) {
      filter.showtime_id = queryData.showtime_id;
    }

    // Lọc bỏ những bản ghi cũ bị thiếu dữ liệu quan trọng nếu cần
    // filter.movie_id = { $ne: null }; 

    const bookings = await Booking.find(filter)
      .populate("user_id", "username email")
      .populate("movie_id", "title poster_url genres")
      .populate("showtime_id")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách booking thành công",
      count: bookings.length,
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
// GET BY ID – Lấy chi tiết 1 booking
// ==============================
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("user_id", "username email")
      .populate("movie_id") // Thêm populate movie
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
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const data = updateBookingStatusSchema.parse(req.body);

    const booking = await Booking.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    )
      .populate("movie_id", "title")
      .populate("showtime_id");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Không tìm thấy booking" });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: booking,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
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

// ==============================
// HOLD SEATS – Giữ ghế tạm thời
// ==============================
export const holdSeats = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = holdSeatsSchema.parse(req.body);

    const { showtime_id, movie_id, locked_seats, payment_method } = data;
    const now = new Date();

    // Kiểm tra ghế đã bị giữ hoặc đã thanh toán chưa
    const conflictBooking = await Booking.findOne({
      showtime_id,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        { "tickets.seat_code": { $in: locked_seats } },
        { locked_seats: { $in: locked_seats } },
      ],
      $or: [
        { status: "confirmed" },
        { expires_at: { $gt: now } }, // Pending nhưng chưa hết hạn
      ],
    });

    if (conflictBooking) {
      return res.status(409).json({
        success: false,
        message: "Một hoặc nhiều ghế đã được giữ hoặc đặt bởi người khác",
      });
    }

    const HOLD_MINUTES = 5;
    const expiresAt = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);

    const booking = await Booking.create({
      user_id: userId,
      movie_id, // Lưu movie_id ngay từ khi giữ chỗ
      showtime_id,
      status: "pending",
      locked_seats,
      expires_at: expiresAt,
      payment_method,
      total_amount: 0,
      tickets: [],
    });

    return res.status(201).json({
      success: true,
      message: "Giữ chỗ thành công trong 5 phút",
      data: {
        booking_id: booking._id,
        movie_id: booking.movie_id,
        expires_at: booking.expires_at,
        locked_seats: booking.locked_seats,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error?.errors?.[0]?.message || error.message || "Giữ chỗ thất bại",
    });
  }
};

// ==============================
// CONFIRM – Xác nhận thanh toán & Hoàn tất vé
// ==============================
export const confirmBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;

    const { tickets } = confirmBookingSchema.parse(req.body);

    const booking = await Booking.findOne({
      _id: bookingId,
      user_id: userId,
      status: "pending",
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking không tồn tại hoặc đã được xử lý trước đó",
      });
    }

    if (booking.expires_at && booking.expires_at < new Date()) {
      booking.status = "failed";
      await booking.save();
      return res.status(400).json({
        success: false,
        message: "Thời gian giữ ghế đã hết hạn",
      });
    }

    const seatCodes = tickets.map((t) => t.seat_code);
    const invalidSeat = seatCodes.find(
      (seat) => !booking.locked_seats.includes(seat),
    );

    if (invalidSeat) {
      return res.status(400).json({
        success: false,
        message: `Ghế ${invalidSeat} không khớp với danh sách đã giữ`,
      });
    }

    const totalAmount = tickets.reduce((sum, t) => sum + t.price, 0);

    booking.tickets = tickets;
    booking.total_amount = totalAmount;
    booking.status = "confirmed";
    booking.locked_seats = []; // Giải phóng locked_seats sau khi xác nhận
    booking.expires_at = null;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Xác nhận đặt vé thành công",
      data: {
        booking_id: booking._id,
        movie_id: booking.movie_id,
        total_amount: booking.total_amount,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error("CONFIRM BOOKING ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi xác nhận đặt vé",
    });
  }
};