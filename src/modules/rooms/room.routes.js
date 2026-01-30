import express from "express";
import { createRoom, deleteRoom, getAllRooms, getRoomById, updateRoom } from "./room.controller.js";

const roomRouter = express.Router();

roomRouter.post("/", createRoom);
roomRouter.get("/", getAllRooms);

roomRouter.get("/:id", getRoomById);
roomRouter.put("/:id", updateRoom);
roomRouter.delete("/:id", deleteRoom);

export default roomRouter;