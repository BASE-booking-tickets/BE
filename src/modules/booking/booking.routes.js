import { Router } from "express";
import {
  createBooking,
  deleteBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
} from "./booking.controller.js";

const bookingRouter = Router();
// CREATE movie
bookingRouter.post("/", createBooking);

// GET all movies
bookingRouter.get("/", getAllBookings);

// GET movie by id
bookingRouter.get("/:id", getBookingById);

// UPDATE movie
bookingRouter.put("/:id/", updateBookingStatus);

// DELETE movie
bookingRouter.delete("/:id", deleteBooking);
export default bookingRouter;
