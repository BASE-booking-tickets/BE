import Booking from "../booking/booking.models.js";
import nodemailer from 'nodemailer';
import Showtime from "./showtimes.models.js";
import {
  createShowtimeSchema,
  updateShowtimeSchema,
  bookSeatsSchema,
} from "./showtimes.schema.js";
import SystemSetting from "../systemSetting/systemSetting.model.js";

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


export const cancelShowtimeAndNotify = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Tìm thông tin suất chiếu trước khi xóa
    const showtime = await Showtime.findById(id).populate('movie_id');
    if (!showtime) {
      return res.status(404).json({ message: "Không tìm thấy lịch chiếu để xóa." });
    }

    // 2. Tìm danh sách khách hàng đã mua vé của suất này
    const bookings = await Booking.find({ showtime_id: id, status: 'confirmed' }).populate('user_id');

    // --- 3. ĐỌC CẤU HÌNH EMAIL TỪ DATABASE ---
    const settings = await SystemSetting.findOne();
    
    // Ưu tiên lấy từ Admin cài đặt, dự phòng bằng email mặc định của bạn nếu DB trống
    const smtpHost = settings?.email?.smtp_host || 'smtp.gmail.com';
    const smtpPort = settings?.email?.smtp_port || 465;
    const smtpUser = settings?.email?.smtp_user || 'tuankhanh111904@gmail.com';
    const smtpPassword = settings?.email?.smtp_password || 'mzpn pria cjmw fnnv';

    // 4. Cấu hình gửi mail với dữ liệu động
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465 || smtpPort === 465, // true nếu dùng port 465 (SSL), false cho 587 (TLS)
      auth: {
        user: smtpUser,
        pass: smtpPassword
      }
    });

    // 5. Gửi thông báo cho từng khách hàng (nếu có)
    if (bookings && bookings.length > 0) {
      for (const booking of bookings) {
        const customerEmail = booking.user_id?.email;
        if (customerEmail) {
          try {
            await transporter.sendMail({
              from: `"CineAdmin Support" <${smtpUser}>`, // Sử dụng email động làm người gửi
              to: customerEmail,
              subject: '[THÔNG BÁO KHẨN] Hủy lịch chiếu phim do sự cố',
              html: `
                <div style="font-family: Arial, sans-serif; border: 1px solid #eee; padding: 20px;">
                  <h2 style="color: #e74c3c;">Rạp phim gặp sự cố kỹ thuật</h2>
                  <p>Chào <b>${booking.user_id?.name || 'Quý khách'}</b>,</p>
                  <p>Rất tiếc, suất chiếu phim <b>${showtime.movie_id?.title || showtime.movie_title}</b> lúc <b>${new Date(showtime.start_time).toLocaleString('vi-VN')}</b> đã bị hủy.</p>
                  <p>Vui lòng liên hệ trực tiếp <b>Zalo của rạp</b> qua số điện thoại <b>0123456789</b> hỗ trợ để được hoàn tiền ngay lập tức.</p>
                  <p>Trân trọng xin lỗi bạn vì sự bất tiện này!</p>
                </div>
              `
            });
          } catch (mailErr) {
            console.error("Lỗi gửi mail cho khách:", customerEmail, mailErr.message);
          }
        }
      }

      // Cập nhật trạng thái các đơn hàng liên quan thành 'cancelled'
      await Booking.updateMany(
        { showtime_id: id, status: 'confirmed' },
        { status: 'cancelled' }
      );
    }

    // 6. THỰC HIỆN XOÁ VĨNH VIỄN LỊCH CHIẾU KHỎI DATABASE
    await Showtime.findByIdAndDelete(id);

    return res.status(200).json({
      message: bookings.length > 0
        ? "Đã xóa lịch chiếu và gửi mail thông báo cho khách."
        : "Đã xóa lịch chiếu thành công (suất này chưa có khách đặt)."
    });

  } catch (error) {
    console.error("Lỗi tại Server:", error);
    return res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
};