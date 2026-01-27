import { z } from "zod";

// Tạo lịch chiếu
export const createShowtimeSchema = z.object({
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),

  screen_name: z.string().min(1, "Tên phòng chiếu không được để trống"),
  movie_id: z.string(),

  movie_title: z.string().min(1),
  movie_poster: z.string().url(),

  base_price: z.number().min(0),
});

// Cập nhật lịch chiếu
export const updateShowtimeSchema = z.object({
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  screen_name: z.string().optional(),
  base_price: z.number().min(0).optional(),
});

// Đặt ghế
export const bookSeatsSchema = z.object({
  seats: z.array(z.string()).min(1, "Phải chọn ít nhất 1 ghế"),
});
