import moment from 'moment';
import qs from 'qs';
import crypto from 'crypto';
import { vnpayConfig } from '../../shared/configs/vnpay.configs.js';
import Booking from '../booking/booking.models.js';
import SystemSetting from '../systemSetting/systemSetting.model.js';
import { sendTicketEmail } from '../../shared/utils/emailService.js';

// --- HÀM HỖ TRỢ SẮP XẾP OBJECT (ĐÃ FIX LỖI PROTOTYPE) ---
function sortObject(obj) {
    let sorted = {};
    let str = [];
    for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (let key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

// ==========================================
// 1. TẠO URL THANH TOÁN (Gửi sang VNPay)
// ==========================================

export const createPaymentUrl = async (req, res) => {
    try {
        const { amount, bankCode, bookingId } = req.body;
        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');

        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            "127.0.0.1";

        // --- ĐỌC CẤU HÌNH ĐỘNG TỪ DATABASE ---
        const settings = await SystemSetting.findOne();

        // Ưu tiên lấy từ Database (Admin cài đặt), nếu Database trống thì lấy fallback từ vnpayConfig (.env)
        const tmnCode = settings?.payment?.vnp_tmnCode || vnpayConfig.vnp_TmnCode;
        const hashSecret = settings?.payment?.vnp_hashSecret || vnpayConfig.vnp_HashSecret;

        // Xác định link chạy thật hay chạy test dựa vào công tắc vnp_is_sandbox
        const isSandbox = settings?.payment?.vnp_is_sandbox !== false; // Mặc định là true nếu chưa cấu hình
        const vnpUrl = isSandbox
            ? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
            : "https://pay.vnpay.vn/vpcpay.html"; 
        let vnp_Params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': tmnCode,     // [ĐÃ ĐỔI]: Dùng biến động
            'vnp_Locale': 'vn',
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': bookingId,
            'vnp_OrderInfo': 'Thanh toan ve xem phim:' + bookingId,
            'vnp_OrderType': 'other',
            'vnp_Amount': amount * 100,
            'vnp_ReturnUrl': vnpayConfig.vnp_ReturnUrl, // ReturnUrl thường cố định theo Domain nên giữ nguyên
            'vnp_IpAddr': ipAddr,
            'vnp_CreateDate': createDate
        };

        if (bankCode) vnp_Params['vnp_BankCode'] = bankCode;

        vnp_Params = sortObject(vnp_Params);
        let signData = qs.stringify(vnp_Params, { encode: false });

        // [ĐÃ ĐỔI]: Dùng biến động hashSecret để tạo mã hóa
        let hmac = crypto.createHmac("sha512", hashSecret);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        vnp_Params['vnp_SecureHash'] = signed;

        // [ĐÃ ĐỔI]: Dùng vnpUrl động để nối chuỗi
        const finalUrl = vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false });

        return res.status(200).json({ paymentUrl: finalUrl });
    } catch (error) {
        console.error("Lỗi createPaymentUrl:", error);
        return res.status(500).json({ message: "Lỗi tạo link thanh toán" });
    }
};

// ==========================================
// 2. XỬ LÝ KẾT QUẢ (VNPay quay về)
// ==========================================

export const vnpayReturn = async (req, res) => {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];
        const responseCode = vnp_Params['vnp_ResponseCode'];
        const txnRef = vnp_Params['vnp_TxnRef'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        
        // [SỬA LẠI]: Đọc cấu hình động từ Database để lấy đúng HashSecret Admin vừa cài đặt
        const settings = await SystemSetting.findOne();
        // Fallback về config gốc nếu trong Database chưa có
        const secretKey = settings?.payment?.vnp_hashSecret || vnpayConfig.vnp_HashSecret;
        
        const signData = qs.stringify(vnp_Params, { encode: false });

        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            if (responseCode === '00') {
                // TÌM VÀ CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG KÈM THEO POPULATE
                const updatedBooking = await Booking.findOneAndUpdate(
                    { txnRef: txnRef },
                    { status: 'confirmed' },
                    { new: true }
                )
                    .populate("movie_id", "title poster_url") // Bổ sung để lấy Tên phim và Link ảnh Poster
                    .populate('showtime_id');                 // Giữ nguyên móc nối lấy thông tin Suất chiếu

                if (updatedBooking) {
                    console.log("✅ Đã xác nhận đơn hàng thành công:", txnRef);
                    
                    // [THÊM MỚI 2]: KÍCH HOẠT GỬI MAIL TỰ ĐỘNG
                    // Chạy ngầm (không dùng await) để API phản hồi ngay lập tức, khách không bị treo màn hình chờ gửi mail
                    sendTicketEmail(updatedBooking._id);

                    return res.status(200).json({
                        success: true,
                        bookingId: txnRef,
                        bookingData: updatedBooking
                    });
                } else {
                    console.error("❌ Không tìm thấy đơn hàng trong DB để update:", txnRef);
                    return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
                }
            }
            return res.status(200).json({ success: false, message: "Giao dịch thất bại tại VNPay" });
        } else {
            console.error("❌ Sai chữ ký bảo mật từ VNPay!");
            return res.status(200).json({ success: false, message: "Sai chữ ký bảo mật" });
        }
    } catch (error) {
        console.error("CRASH TẠI VNPAY_RETURN:", error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
};