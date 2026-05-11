// src/shared/utils/cronJob.js
import cron from 'node-cron';
import Booking from '../../modules/booking/booking.models.js';

export const initCronJobs = () => {
    // Chạy mỗi phút một lần (ký hiệu '* * * * *')
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();

            // Tìm và cập nhật các đơn hàng hết hạn
            const result = await Booking.updateMany(
                {
                    status: 'pending',
                    expires_at: { $lt: now } // expires_at < giờ hiện tại
                },
                {
                    $set: { status: 'cancelled' }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`[Cron Job] đã tự động hủy ${result.modifiedCount} đơn hàng hết hạn.`);
            }
        } catch (error) {
            console.error('[Cron Job Error]:', error);
        }
    });
};