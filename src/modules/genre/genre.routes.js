import express from "express";
import { createGenre, deleteGenre, getAllGenres, updateGenre } from "./genre.controller.js";


const genreRoutes = express.Router();

// Public: Ai cũng có thể xem danh sách thể loại
genreRoutes.get("/", getAllGenres);

// Admin: Chỉ admin mới được thêm, sửa, xóa
genreRoutes.post("/", createGenre); // Có thể thêm verifyAdmin vào đây
genreRoutes.put("/:id", updateGenre);
genreRoutes.delete("/:id", deleteGenre);

export default genreRoutes;