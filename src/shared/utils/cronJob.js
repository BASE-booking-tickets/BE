// src/shared/utils/cronJob.js
import cron from 'node-cron';
import Booking from '../../modules/booking/booking.models.js';
import Showtime from '../../modules/showtimes/showtimes.models.js';


export const initCronJobs = () => {

    /**
     * TÁC VỤ 1: Tự động hủy các đơn hàng hết hạn thanh toán
     * Tần suất: Chạy mỗi phút một lần ('* * * * *')
     */
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();

            const result = await Booking.updateMany(
                {
                    status: 'pending',
                    expires_at: { $lt: now }
                },
                {
                    $set: { status: 'cancelled' }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`[Cron Job - Booking] Đã tự động hủy ${result.modifiedCount} đơn hàng hết hạn.`);
            }
        } catch (error) {
            console.error('[Cron Job Booking Error]:', error);
        }
    });

    /**
     * TÁC VỤ 2: Tự động xóa vĩnh viễn các lịch chiếu đã kết thúc
     * Tần suất: Chạy vào phút thứ 0 của mỗi giờ ('0 * * * *') - ví dụ: 10:00, 11:00, 12:00...
     * Cách này giúp giảm tải cho server so với việc quét mỗi phút.
     */
    cron.schedule('0 * * * *', async () => {
        try {
            const now = new Date();

            // Thực hiện xóa thẳng các lịch chiếu có thời gian kết thúc nhỏ hơn hiện tại
            const result = await Showtime.deleteMany({
                end_time: { $lt: now }
            });

            if (result.deletedCount > 0) {
                console.log(`[Cron Job - Showtime] Đã tự động dọn dẹp vĩnh viễn ${result.deletedCount} lịch chiếu đã cũ.`);
            }
        } catch (error) {
            console.error('[Cron Job Showtime Error]:', error);
        }
    });
};