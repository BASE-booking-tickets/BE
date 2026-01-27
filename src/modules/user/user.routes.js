import express from "express";

import { authMiddleware } from "../../shared/middlewares/checkAuth.js";
import { requireRole } from "../../shared/middlewares/checkPermission.js";
import {
  getAllUsers,
  getProfile,
  login,
  logout,
  register,
  updateProfile,
  updateUserRoles,
} from "./user.controller.js";

const UserRouter = express.Router();

// AUTH
// Register
UserRouter.post("/register", register);

// Login
UserRouter.post("/login", login);

//Logout
UserRouter.post("/logout", authMiddleware, logout);

// USER (Authenticated)
// Get profile (me)
UserRouter.get("/user", authMiddleware, getProfile);

// Update profile
UserRouter.put("/user", authMiddleware, updateProfile);

// ADMIN
// Get all users
UserRouter.get("/admin", authMiddleware, requireRole("admin"), getAllUsers);

// Update user roles
UserRouter.put(
  "/admin/:id/roles",
  authMiddleware,
  requireRole("admin"),
  updateUserRoles,
);

export default UserRouter;
