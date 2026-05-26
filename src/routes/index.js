import { Router } from "express";
import filmsRouter from "../modules/films/films.routes.js";
import bookingRouter from "../modules/booking/booking.routes.js";
import UserRouter from "../modules/user/user.routes.js";
import authRouter from "../modules/auth/auth.routes.js";
import showtimeRouter from "../modules/showtimes/showtimes.routes.js";
import roomRouter from "../modules/rooms/room.routes.js";
import paymenRouter from "../modules/payment/cnpay.routes.js";
import genreRoutes from "../modules/genre/genre.routes.js";
import settingsRouter from "../modules/systemSetting/settings.route.js";

const router = Router();

router.use("/films", filmsRouter);
router.use("/bookings", bookingRouter);
router.use("/user", UserRouter);
router.use("/auth", authRouter);
router.use("/showtimes", showtimeRouter);
router.use("/room", roomRouter);
router.use("/payment", paymenRouter);
router.use("/genres", genreRoutes);
router.use("/settings", settingsRouter);

export default router;
