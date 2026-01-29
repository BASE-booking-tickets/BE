import { Router } from "express";
import {
  checkInBooking,
  createBooking,
  getAllBookings,
  getBookingById,
  staffCreateBooking,
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
bookingRouter.put("/:id", authMiddleware, updateBookingStatus);

/**
 * =========================
 * DELETE BOOKING
 * =========================
 * DELETE /booking/:id
 */
bookingRouter.delete("/:id", authMiddleware, deleteBooking);

//CUSTOMER (khách hàng)

// CREATE movie
bookingRouter.post(
  "/",
  // authMiddleware, requireRole("customer"),
  createBooking,
);

// Xem booking của mình
bookingRouter.get(
  "/me",
  // authMiddleware,
  // requireRole("customer"),
  getAllBookings,
);

//  STAFF (nhân viên rạp)
// Đặt vé tại quầy
bookingRouter.post(
  "/staff/create",
  // authMiddleware,
  // requireRole("staff"),
  staffCreateBooking,
);

// Check-in vé
bookingRouter.post(
  "/staff/check-in",
  // authMiddleware,
  // requireRole("staff"),
  checkInBooking,
);

//ADMIN (quản lý)
// GET all movies
bookingRouter.get(
  "/",
  // authMiddleware, requireRole("admin"),
  getAllBookings,
);

// GET movie by id
bookingRouter.get(
  "/:id",
  // authMiddleware,
  // requireRole("admin", "staff"),
  getBookingById,
);

// UPDATE movie
bookingRouter.put(
  "/:id/status",
  // authMiddleware,
  // requireRole("admin"),
  updateBookingStatus,
);

// DELETE movie
bookingRouter.delete(
  "/:id",
  // authMiddleware,
  // requireRole("admin"),
  deleteBooking,
);
export default bookingRouter;
