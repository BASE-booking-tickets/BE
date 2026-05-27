import express from "express";
import { createCombo, deleteCombo, getAllCombos, getComboById, updateCombo } from "./combo.controller.js";
import { authMiddleware } from "../../shared/middlewares/checkAuth.js";




const comboRouter = express.Router();

// Route Public (Khách hàng xem danh sách Combo khi chọn ghế)
comboRouter.get("/", getAllCombos);
comboRouter.get("/:id", getComboById);

// Route Private (Chỉ Admin mới có quyền thao tác dữ liệu)
comboRouter.post("/", authMiddleware, createCombo);
comboRouter.put("/:id", authMiddleware, updateCombo);
comboRouter.delete("/:id", authMiddleware, deleteCombo);

export default comboRouter;