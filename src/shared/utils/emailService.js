import nodemailer from "nodemailer";
import SystemSetting from "../../modules/systemSetting/systemSetting.model.js";
import Booking from "../../modules/booking/booking.models.js";

export const sendTicketEmail = async (bookingId) => {
  try {
    // 1. Lấy thông tin đơn hàng chi tiết
    const booking = await Booking.findById(bookingId)
      .populate("user_id")
      .populate({
        path: "showtime_id",
        populate: { path: "movie_id" }
      })
      .populate("foods.combo_id"); // Lấy chi tiết thông tin món ăn

    // 📸 MÁY QUAY LÉN EMAIL: Kiểm tra xem Email có đọc được mảng foods không
    console.log("-----------------------------------------");
    console.log("🍿 [DEBUG EMAIL] Dữ liệu foods chuẩn bị in ra vé:");
    console.log(JSON.stringify(booking.foods, null, 2));
    console.log("-----------------------------------------");

    if (!booking || !booking.user_id?.email) {
      console.log(`[Email] Không tìm thấy đơn hàng hoặc email khách hàng cho ID: ${bookingId}`);
      return false;
    }

    // 2. Lấy cấu hình SMTP động từ Database
    const settings = await SystemSetting.findOne();
    const isAutoSend = settings?.email?.auto_send_ticket !== false;
    if (!isAutoSend) {
      console.log("[Email] Chức năng tự động gửi vé qua Email đang bị TẮT.");
      return false;
    }

    const smtpHost = settings?.email?.smtp_host || "smtp.gmail.com";
    const smtpPort = settings?.email?.smtp_port || 465;
    const smtpUser = settings?.email?.smtp_user;
    const smtpPassword = settings?.email?.smtp_password;

    if (!smtpUser || !smtpPassword) {
      console.log("[Email] Chưa cấu hình tài khoản Email.");
      return false;
    }

    // 3. Khởi tạo cấu hình kết nối Mailer
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPassword }
    });

    // 4. Chuẩn bị thông tin hiển thị trên vé
    const movieTitle = booking.showtime_id?.movie_id?.title || "Phim trực tuyến";
    const startTime = booking.showtime_id?.start_time
      ? new Date(booking.showtime_id.start_time).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })
      : "N/A";
    const roomName = booking.showtime_id?.screen_name || "N/A";
    const seats = booking.locked_seats ? booking.locked_seats.join(", ") : "N/A";
    const amount = booking.total_amount ? booking.total_amount.toLocaleString("vi-VN") + "đ" : "0đ";

    // Xây dựng khối HTML Bắp Nước
    let comboHtml = '';
    if (booking.foods && booking.foods.length > 0) {
      const listItems = booking.foods.map(item => {
        const comboName = item.combo_id?.name || "Combo bắp nước";
        const totalItemPrice = item.price * item.quantity;
        return `
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${comboName}</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #111827; text-align: center;">x${item.quantity}</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #4b5563; text-align: right;">${totalItemPrice.toLocaleString('vi-VN')}đ</td>
                    </tr>
                `;
      }).join('');

      comboHtml = `
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                    <h4 style="margin: 0 0 10px 0; color: #111827; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">🍿 Đồ ăn & Thức uống:</h4>
                    <table style="width: 100%; font-size: 13px; border-collapse: collapse; color: #4b5563;">
                        <thead>
                            <tr style="color: #6b7280; font-weight: 600;">
                                <th style="text-align: left; padding-bottom: 6px;">Tên món</th>
                                <th style="text-align: center; padding-bottom: 6px; width: 15%;">SL</th>
                                <th style="text-align: right; padding-bottom: 6px; width: 25%;">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${listItems}
                        </tbody>
                    </table>
                </div>
            `;
    }

    const qrCodeUrl = `https://quickchart.io/qr?text=${booking._id.toString()}&size=250`;

    // 5. Gửi email
    await transporter.sendMail({
      from: `"NCC Cinema" <${smtpUser}>`,
      to: booking.user_id.email,
      subject: `[NCC Cinema] Vé Xem Phim - Đơn #${booking._id.toString().slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #e11d48; padding: 24px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; font-weight: 900;">Đặt Vé Thành Công</h1>
          </div>
          
          <div style="padding: 32px; background-color: #ffffff;">
            <div style="background-color: #f9fafb; border: 1px dashed #d1d5db; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="margin-top: 0; color: #111827; font-size: 18px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; text-transform: uppercase;">${movieTitle}</h3>
              
              <table style="width: 100%; font-size: 14px; border-collapse: collapse; color: #4b5563;">
                <tr><td style="padding: 6px 0; font-weight: 600; width: 35%;">Thời gian:</td><td style="padding: 6px 0;">${startTime}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600;">Phòng chiếu:</td><td style="padding: 6px 0; color: #e11d48; font-weight: bold;">${roomName}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600;">Ghế ngồi:</td><td style="padding: 6px 0; font-weight: bold;">${seats}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600;">Mã đơn hàng:</td><td style="padding: 6px 0; font-family: monospace;">${booking._id}</td></tr>
                
                <tr>
                  <td colspan="2">
                    ${comboHtml}
                  </td>
                </tr>

                <tr style="border-top: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0 0 0; font-weight: bold; color: #111827; font-size: 16px;">Tổng tiền:</td>
                  <td style="padding: 12px 0 0 0; color: #10b981; font-weight: bold; font-size: 18px;">${amount}</td>
                </tr>
              </table>

              <div style="text-align: center; margin-top: 30px; border-top: 1px dashed #d1d5db; padding-top: 20px;">
                <p style="font-size: 12px; font-weight: bold; margin-bottom: 12px;">Mã QR Check-in</p>
                <img src="${qrCodeUrl}" alt="QR Code" style="width: 160px; height: 160px;" />
              </div>
            </div>
          </div>
        </div>
      `
    });

    console.log(`[Email] Đã gửi vé thành công cho đơn hàng: ${bookingId}`);
    return true;
  } catch (error) {
    console.error("[Email] Lỗi trong quá trình xử lý gửi vé:", error);
    return false;
  }
};