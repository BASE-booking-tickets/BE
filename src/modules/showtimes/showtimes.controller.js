import Showtime from "./showtimes.models.js";
import {
  createShowtimeSchema,
  updateShowtimeSchema,
  bookSeatsSchema,
} from "./showtimes.schema.js";

// Lấy tất cả lịch chiếu
export const getAllShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.find().sort({ start_time: 1 });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách lịch chiếu thành công",
      data: showtimes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy chi tiết 1 lịch chiếu
export const getShowtimeById = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id);

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch chiếu",
      });
    }

    res.status(200).json({
      success: true,
      data: showtime,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Tạo lịch chiếu
export const createShowtime = async (req, res) => {
  try {
    const data = createShowtimeSchema.parse(req.body);

    const showtime = await Showtime.create({
      ...data,
      start_time: new Date(data.start_time),
      end_time: new Date(data.end_time),
    });

    res.status(201).json({
      success: true,
      message: "Tạo lịch chiếu thành công",
      data: showtime,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Cập nhật lịch chiếu
export const updateShowtime = async (req, res) => {
  try {
    const data = updateShowtimeSchema.parse(req.body);

    const showtime = await Showtime.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch chiếu",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật lịch chiếu thành công",
      data: showtime,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Xóa lịch chiếu
export const deleteShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndDelete(req.params.id);

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch chiếu",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa lịch chiếu thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Đặt ghế
export const bookSeats = async (req, res) => {
  try {
    const { seats } = bookSeatsSchema.parse(req.body);

    const showtime = await Showtime.findById(req.params.id);

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch chiếu",
      });
    }

    // Kiểm tra ghế đã bị đặt chưa
    const duplicatedSeats = seats.filter((seat) =>
      showtime.seats_booked.includes(seat),
    );

    if (duplicatedSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Ghế đã được đặt: ${duplicatedSeats.join(", ")}`,
      });
    }

    showtime.seats_booked.push(...seats);
    await showtime.save();

    res.status(200).json({
      success: true,
      message: "Đặt ghế thành công",
      data: showtime.seats_booked,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
