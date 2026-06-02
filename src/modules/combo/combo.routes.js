import express from "express";
import { createCombo, deleteCombo, getAllCombos, getComboById, updateCombo } from "./combo.controller.js";
import { authMiddleware } from "../../shared/middlewares/checkAuth.js";
import upload from "../../shared/middlewares/upload.js";




const comboRouter = express.Router();

// Route Public (Khách hàng xem danh sách Combo khi chọn ghế)
comboRouter.get("/", getAllCombos);
comboRouter.get("/:id", getComboById);

// Route Private (Chỉ Admin mới có quyền thao tác dữ liệu)
comboRouter.post("/", authMiddleware, upload.single('image'), createCombo);
comboRouter.put("/:id", authMiddleware, upload.single('image'), updateCombo);
comboRouter.delete("/:id", authMiddleware, deleteCombo);

export default comboRouter;