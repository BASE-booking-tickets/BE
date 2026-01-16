import { Router } from "express";
import filmsRouter from "../modules/films/films.routes.js";

const router = Router();

router.use("/films", filmsRouter);

export default router;
