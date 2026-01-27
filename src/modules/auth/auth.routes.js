import express from "express";
import { authLogin, authRegister } from "./auth.controller.js";

const authRouter = express.Router();

authRouter.post("/register", authRegister);
authRouter.post("/login", authLogin);

export default authRouter;
