import { Router } from "express";
import {
  checkInBooking,
  createBooking,
  deleteBooking,
  getAllBookings,
  getBookingById,
  staffCreateBooking,
  updateBookingStatus,
} from "./booking.controller.js";
import { authMiddleware } from "../../shared/middlewares/checkAuth.js";

const bookingRouter = Router();
// CREATE movie
bookingRouter.post("/", authMiddleware, createBooking);

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
