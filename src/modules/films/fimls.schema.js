import z from "zod";

export const movieCreateSchema = z.object({
  // ===== Thông tin cơ bản =====
  title: z.string().min(1).max(255),

  slug: z.string().min(1).max(255),

  description: z.string().optional(),

  duration_min: z.number().int().positive(),

  release_date: z.coerce.date(), // nhận string → Date

  // ===== Phân loại =====
  genres: z.array(z.string()).min(1),

  status: z
    .enum(["released", "now_showing", "coming_soon", "ended"])
    .optional(),

  // ===== Ekip =====
  director: z.string().optional(),

  cast: z.array(z.string()).optional(),

  // ===== Hình ảnh =====
  poster_url: z.string().url(),

  banner_url: z.string().url().optional(),

  // ===== Đánh giá =====
  rating_stats: z
    .object({
      average: z.number().min(0).max(10).optional(),
      count: z.number().min(0).optional(),
    })
    .optional(),
});

export const movieUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),

  slug: z.string().min(1).max(255).optional(),

  description: z.string().optional(),

  duration_min: z.number().int().positive().optional(),

  release_date: z.coerce.date().optional(),

  genres: z.array(z.string()).min(1).optional(),

  status: z
    .enum(["released", "now_showing", "coming_soon", "ended"])
    .optional(),

  director: z.string().optional(),

  cast: z.array(z.string()).optional(),

  poster_url: z.string().url().optional(),

  banner_url: z.string().url().optional(),

  rating_stats: z
    .object({
      average: z.number().min(0).max(10).optional(),
      count: z.number().min(0).optional(),
    })
    .optional(),
});
