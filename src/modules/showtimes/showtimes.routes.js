import express from "express";
import {
  bookSeats,
  createShowtime,
  deleteShowtime,
  getAllShowtimes,
  getShowtimeById,
  updateShowtime,
} from "./showtimes.controller.js";

const showtimeRouter = express.Router();

// Lấy danh sách lịch chiếu
showtimeRouter.get("/", getAllShowtimes);

// Lấy chi tiết lịch chiếu
showtimeRouter.get("/:id", getShowtimeById);

// Quản lý lịch chiếu (admin / staff)
showtimeRouter.post("/", createShowtime);
showtimeRouter.put("/:id", updateShowtime);
showtimeRouter.delete("/:id", deleteShowtime);

// Đặt ghế
showtimeRouter.post("/:id/book-seats", bookSeats);

export default showtimeRouter;
