import { Router } from "express";
import { getSettings, updateSettings } from "./settings.controller.js";


const settingsRouter = Router();

// API lấy cấu hình (Có thể mở cho Staff xem hoặc chặn tùy nghiệp vụ của bạn)
settingsRouter.get("/", getSettings);

// API cập nhật cấu hình (Bắt buộc phải qua bộ lọc bảo vệ Admin)
settingsRouter.put("/", updateSettings);

export default settingsRouter;