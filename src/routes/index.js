import { Router } from "express";
import filmsRouter from "../modules/films/films.routes.js";
import bookingRouter from "../modules/booking/booking.routes.js";
import UserRouter from "../modules/user/user.routes.js";
import authRouter from "../modules/auth/auth.routes.js";
import showtimeRouter from "../modules/showtimes/showtimes.routes.js";
import roomRouter from "../modules/rooms/room.routes.js";
import paymenRouter from "../modules/payment/cnpay.routes.js";

const router = Router();

router.use("/films", filmsRouter);
router.use("/bookings", bookingRouter);
router.use("/user", UserRouter);
router.use("/userAdmin", UserRouter);
router.use("/auth", authRouter);
router.use("/showtimes", showtimeRouter);
router.use("/room", roomRouter);
router.use("/payment", paymenRouter);

export default router;
