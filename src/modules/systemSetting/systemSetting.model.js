import mongoose from "mongoose";

const systemSettingSchema = new mongoose.Schema(
  {
    // Tab: Thanh toán & Giao dịch
    payment: {
      seat_hold_timeout_minutes: { type: Number, default: 5 }, // Mặc định giữ ghế 5 phút
      vnp_tmnCode: { type: String, default: "" },
      vnp_hashSecret: { type: String, default: "" },
      vnp_is_sandbox: { type: Boolean, default: true }, // Môi trường Test hay Thật
      min_cancel_time_hours: { type: Number, default: 1 } // Quy định: Không cho hủy vé trước giờ chiếu 1 tiếng
    },

    // Tab: Thông báo & Email
    email: {
      smtp_host: { type: String, default: "smtp.gmail.com" },
      smtp_port: { type: Number, default: 465 }, // Port bảo mật SSL của Gmail
      smtp_user: { type: String, default: "" }, // Email gửi đi
      smtp_password: { type: String, default: "" }, // App Password của Gmail
      auto_send_ticket: { type: Boolean, default: true } // Có tự động gửi vé QR qua mail không
    }
  },
  { 
    timestamps: true 
  }
);

const SystemSetting = mongoose.model("SystemSetting", systemSettingSchema);
export default SystemSetting;