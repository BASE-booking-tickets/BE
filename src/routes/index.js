import { Router } from "express";
import filmsRouter from "../modules/films/films.routes.js";
import bookingRouter from "../modules/booking/booking.routes.js";

const router = Router();

router.use("/films", filmsRouter);
router.use("/booking", bookingRouter);

export default router;
