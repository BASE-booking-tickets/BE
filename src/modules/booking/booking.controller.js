import Booking from "./booking.models.js";
import {
  bookingQuerySchema,
  createBookingSchema,
  holdSeatsSchema,
  updateBookingStatusSchema,
} from "./booking.schema.js";

// ==============================
// CREATE – Tạo đơn đặt vé
// ==============================
export const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    // Validate dữ liệu đầu vào
    const data = createBookingSchema.parse(req.body);

    // (Khuyến nghị) Tính lại total_amount từ tickets để tránh gian lận
    const calculatedTotal = data.tickets.reduce(
      (sum, ticket) => sum + ticket.price,
      0,
    );

    if (calculatedTotal !== data.total_amount) {
      return res.status(400).json({
        success: false,
        message: "Total amount không khớp với giá vé",
      });
    }

    const booking = await Booking.create({
      ...data,
      user_id: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo đơn đặt vé thành công",
      data: booking,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.errors?.[0]?.message || error.message,
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
export const updateBookingStatus = async (req, res) => {
  console.log(updateBookingStatus);
  try {
    const { id } = req.params;

    // Validate body theo Zod
    const { status } = updateBookingStatusSchema.parse(req.body);

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy booking",
      });
    }

    // ❌ Không cho update nếu booking đã kết thúc
    if (["confirmed", "cancelled", "failed"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Không thể cập nhật booking ở trạng thái "${booking.status}"`,
      });
    }

    // ✅ pending → trạng thái hợp lệ (đã được Zod validate)
    booking.status = status;
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái booking thành công",
      data: booking,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error?.errors?.[0]?.message || error.message || "Dữ liệu không hợp lệ",
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
    const { id } = req.params;
    const data = createBookingSchema.parse(req.body);

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false });
    }

    // ❌ Hết hạn giữ ghế
    if (booking.expires_at < new Date()) {
      booking.status = "cancelled";
      await booking.save();
      return res.status(400).json({
        success: false,
        message: "Giữ ghế đã hết hạn",
      });
    }

    // ✅ Tính lại tiền
    const calculatedTotal = data.tickets.reduce((sum, t) => sum + t.price, 0);

    if (calculatedTotal !== data.total_amount) {
      return res.status(400).json({
        success: false,
        message: "Total không hợp lệ",
      });
    }

    booking.tickets = data.tickets;
    booking.total_amount = calculatedTotal;
    booking.status = "confirmed";
    booking.locked_seats = [];
    booking.qr_code_url = data.qr_code_url;

    await booking.save();

    return res.json({
      success: true,
      message: "Thanh toán thành công",
      data: booking,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
