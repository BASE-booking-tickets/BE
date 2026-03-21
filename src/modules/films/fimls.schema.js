import z from "zod";

// Regex kiểm tra định dạng MongoDB ObjectId (24 ký tự hex)
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const movieCreateSchema = z.object({
  // ===== Thông tin cơ bản =====
  title: z.string().trim().min(1, "Tiêu đề không được để trống").max(255),

  slug: z.string().trim().min(1, "Slug không được để trống").max(255),

  description: z.string().optional(),

  duration_min: z.number().int().positive("Thời lượng phải là số dương"),

  release_date: z.coerce.date({
    errorMap: () => ({ message: "Ngày phát hành không hợp lệ" })
  }),

  // ===== Phân loại (Tham chiếu Genre) =====
  genres: z
    .array(z.string().regex(objectIdRegex, "ID thể loại không hợp lệ"))
    .min(1, "Phải chọn ít nhất một thể loại"),

  status: z
    .enum(["released", "now_showing", "coming_soon", "ended"])
    .default("coming_soon"),

  // ===== Ekip =====
  director: z.string().trim().optional(),

  cast: z.array(z.string()).default([]),

  // ===== Hình ảnh =====
  poster_url: z.string().url("Link poster không đúng định dạng"),

  banner_url: z.string().url("Link banner không đúng định dạng").optional().or(z.literal("")),

  // ===== Đánh giá (Thường để mặc định khi tạo mới) =====
  rating_stats: z
    .object({
      average: z.number().min(0).max(10).optional().default(0),
      count: z.number().min(0).optional().default(0),
    })
    .optional(),
});

// Sử dụng .partial() hoặc định nghĩa lại cho Update
export const movieUpdateSchema = movieCreateSchema.partial().extend({
  // Nếu có trường nào đặc biệt cần giữ nguyên ràng buộc thì ghi đè tại đây
  // Ví dụ: Genres nếu đã cập nhật thì vẫn phải có ít nhất 1 cái
  genres: z.array(z.string().regex(objectIdRegex)).min(1).optional(),
});