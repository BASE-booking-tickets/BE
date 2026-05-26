import nodemailer from "nodemailer";
import SystemSetting from "../../modules/systemSetting/systemSetting.model.js";
import Booking from "../../modules/booking/booking.models.js";

export const sendTicketEmail = async (bookingId) => {
    try {
        // 1. Lấy thông tin đơn hàng chi tiết (Nối với User, Showtime, Movie)
        const booking = await Booking.findById(bookingId)
            .populate("user_id")
            .populate({
                path: "showtime_id",
                populate: { path: "movie_id" }
            });

        if (!booking || !booking.user_id?.email) {
            console.log(`[Email] Không tìm thấy đơn hàng hoặc email khách hàng cho ID: ${bookingId}`);
            return false;
        }

        // 2. Lấy cấu hình SMTP động từ Database
        const settings = await SystemSetting.findOne();

        // Kiểm tra xem Admin có bật công tắc tự động gửi vé không
        const isAutoSend = settings?.email?.auto_send_ticket !== false; // Mặc định true nếu chưa cấu hình
        if (!isAutoSend) {
            console.log("[Email] Chức năng tự động gửi vé qua Email đang bị TẮT ở trang cấu hình.");
            return false;
        }

        const smtpHost = settings?.email?.smtp_host || "smtp.gmail.com";
        const smtpPort = settings?.email?.smtp_port || 465;
        const smtpUser = settings?.email?.smtp_user;
        const smtpPassword = settings?.email?.smtp_password;

        if (!smtpUser || !smtpPassword) {
            console.log("[Email] Chưa cấu hình tài khoản Email gửi trong trang Admin Settings.");
            return false;
        }

        // 3. Khởi tạo cấu hình kết nối Mailer
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465, // true cho cổng 465, false cho 587
            auth: {
                user: smtpUser,
                pass: smtpPassword
            }
        });

        // 4. Chuẩn bị thông tin hiển thị trên vé
        const movieTitle = booking.showtime_id?.movie_id?.title || "Phim trực tuyến";
        const startTime = booking.showtime_id?.start_time
            ? new Date(booking.showtime_id.start_time).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })
            : "N/A";
        const roomName = booking.showtime_id?.screen_name || "N/A";
        const seats = booking.locked_seats ? booking.locked_seats.join(", ") : "N/A";
        const amount = booking.total_amount ? booking.total_amount.toLocaleString("vi-VN") + "đ" : "0đ";

        // TẠO URL MÃ QR CHỨA ID ĐƠN HÀNG THÔNG QUA API QUICKCHART
        const qrCodeUrl = `https://quickchart.io/qr?text=${booking._id.toString()}&size=250`;

        // 5. Gửi email với giao diện thiết kế mẫu chuyên nghiệp
        await transporter.sendMail({
            from: `"NCC Cinema Support" <${smtpUser}>`,
            to: booking.user_id.email,
            subject: `[NCC Cinema] Vé Xem Phim Điện Tử Của Bạn - Mã Đơn #${booking._id.toString().slice(-6).toUpperCase()}`,
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background-color: #e11d48; padding: 24px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900;">Đặt Vé Thành Công</h1>
            <p style="margin: 4px 0 0 0; opacity: 0.8; font-size: 14px;">Cảm ơn bạn đã lựa chọn dịch vụ của NCC Cinema</p>
          </div>
          
          <div style="padding: 32px; background-color: #ffffff;">
            <p style="margin-top: 0; color: #374151;">Chào <b>${booking.user_id.name || "Quý khách"}</b>,</p>
            <p style="color: #4b5563; line-height: 1.6;">Yêu cầu đặt vé của bạn đã được xác nhận thanh toán hợp lệ. Dưới đây là thông tin chi tiết vé xem phim điện tử của bạn:</p>
            
            <div style="background-color: #f9fafb; border: 1px dashed #d1d5db; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="margin-top: 0; color: #111827; font-size: 18px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; text-transform: uppercase;">${movieTitle}</h3>
              
              <table style="width: 100%; font-size: 14px; border-collapse: collapse; color: #4b5563;">
                <tr>
                  <td style="padding: 6px 0; font-weight: 600; width: 35%;">Thời gian:</td>
                  <td style="padding: 6px 0; color: #111827;">${startTime}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600;">Phòng chiếu:</td>
                  <td style="padding: 6px 0; color: #e11d48; font-weight: bold;">${roomName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600;">Ghế ngồi:</td>
                  <td style="padding: 6px 0; color: #111827; font-weight: bold; letter-spacing: 1px;">${seats}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600;">Mã đơn hàng:</td>
                  <td style="padding: 6px 0; font-family: monospace; color: #6b7280;">${booking._id}</td>
                </tr>
                <tr style="border-top: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0 0 0; font-weight: bold; color: #111827; font-size: 16px;">Tổng tiền:</td>
                  <td style="padding: 12px 0 0 0; color: #10b981; font-weight: bold; font-size: 18px;">${amount}</td>
                </tr>
              </table>

              <div style="text-align: center; margin-top: 30px; border-top: 1px dashed #d1d5db; padding-top: 20px;">
                <p style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin-bottom: 12px;">Mã QR Check-in</p>
                <img src="${qrCodeUrl}" alt="QR Code" style="width: 160px; height: 160px; border: 4px solid white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
                <p style="font-size: 11px; color: #9ca3af; margin-top: 8px; font-family: monospace;">${booking._id}</p>
              </div>
            </div>
            
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 12px; border-radius: 4px; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 13px; color: #15803d; font-weight: 500;">
                💡 <b>Hướng dẫn nhận vé vào rạp:</b> Bạn có thể quét mã QR Check-in phía trên tại quầy hoặc cung cấp Mã đơn hàng cho nhân viên để nhận vé vào phòng chiếu.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 12px; text-align: center; margin-bottom: 0; line-height: 1.5;">
              Đây là thư gửi tự động, vui lòng không phản hồi lại email này.<br/>
              Mọi thắc mắc vui lòng liên hệ hotline bộ phận CSKH rạp phim.
            </p>
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