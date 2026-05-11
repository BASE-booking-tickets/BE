import { Router } from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  holdSeats,
  confirmBooking,
} from "./booking.controller.js";

import { authMiddleware } from "../../shared/middlewares/checkAuth.js";

const bookingRouter = Router();

/**
 * =========================
 * HOLD SEATS (GIỮ GHẾ)
 * =========================
 * POST /booking/hold
 */
bookingRouter.post("/hold", authMiddleware, holdSeats);

/**
 * =========================
 * CONFIRM BOOKING (XÁC NHẬN + TẠO VÉ)
 * =========================
 * POST /booking/:id/confirm
 */
bookingRouter.post("/:id/confirm", authMiddleware, confirmBooking);

/**
 * =========================
 * CREATE BOOKING (fallback)
 * =========================
 * POST /booking
 */
bookingRouter.post("/", authMiddleware, createBooking);

/**
 * =========================
 * GET ALL BOOKINGS
 * =========================
 * GET /booking
 */
bookingRouter.get("/", getAllBookings);

/**
 * =========================
 * GET BOOKING BY ID
 * =========================
 * GET /booking/:id
 */
bookingRouter.get("/:id", getBookingById);

/**
 * =========================
 * UPDATE BOOKING STATUS
 * =========================
 * PUT /booking/:id
 */
bookingRouter.put("/:id", updateBookingStatus);

/**
 * =========================
 * DELETE BOOKING
 * =========================
 * DELETE /booking/:id
 */
bookingRouter.delete("/:id", authMiddleware, deleteBooking);

export default bookingRouter;
