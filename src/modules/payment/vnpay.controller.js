import moment from 'moment';
import qs from 'qs';
import crypto from 'crypto';
import { vnpayConfig } from '../../shared/configs/vnpay.configs.js';
import Booking from '../booking/booking.models.js';

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

        let vnp_Params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': vnpayConfig.vnp_TmnCode,
            'vnp_Locale': 'vn',
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': bookingId,
            'vnp_OrderInfo': 'Thanh toan ve xem phim:' + bookingId,
            'vnp_OrderType': 'other',
            'vnp_Amount': amount * 100, // VNPay yêu cầu nhân 100
            'vnp_ReturnUrl': vnpayConfig.vnp_ReturnUrl,
            'vnp_IpAddr': ipAddr,
            'vnp_CreateDate': createDate
        };

        if (bankCode) vnp_Params['vnp_BankCode'] = bankCode;

        vnp_Params = sortObject(vnp_Params);
        let signData = qs.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        vnp_Params['vnp_SecureHash'] = signed;
        const finalUrl = vnpayConfig.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });

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
        const secretKey = vnpayConfig.vnp_HashSecret;
        const signData = qs.stringify(vnp_Params, { encode: false });

        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            if (responseCode === '00') {
                // TÌM VÀ CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
                const updatedBooking = await Booking.findOneAndUpdate(
                    { txnRef: txnRef }, 
                    { status: 'confirmed' }, 
                    { new: true }
                ).populate('showtime_id');

                if (updatedBooking) {
                    console.log("✅ Đã xác nhận đơn hàng thành công:", txnRef);
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