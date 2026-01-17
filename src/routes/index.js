import { Router } from "express";
import filmsRouter from "../modules/films/films.routes.js";
import bookingRouter from "../modules/booking/booking.routes.js";
import UserRouter from "../modules/user/user.routes.js";

const router = Router();

router.use("/films", filmsRouter);
router.use("/booking", bookingRouter);
router.use("/userAdmin", UserRouter);

export default router;
