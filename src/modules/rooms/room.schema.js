import { z } from "zod";

export const roomCreateSchema = z.object({
  name: z.string().min(1, "Tên phòng không được để trống"),
  // Thêm trường type để khớp với "Công nghệ / Loại màn hình" trên UI của bạn
  type: z.string().optional().default("2D"), 
  // Nếu FE không gửi rows/columns, Zod sẽ tự điền giá trị mặc định là 10
  rows: z.number().min(1).max(26).optional().default(10),
  columns: z.number().min(1).optional().default(10),
  status: z.enum(["active", "maintenance"]).optional().default("active"),
});

// room.schema.js
export const roomUpdateSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  status: z.enum(["active", "maintenance"]).optional(),
  seat_layout: z.array(z.object({
    id: z.string(),
    row: z.string(),
    number: z.number(),
    type: z.enum(['standard', 'vip', 'couple']), //
    is_hidden: z.boolean(),
    price_modifier: z.number().optional()
  })).optional(),
  capacity: z.number().optional()
});