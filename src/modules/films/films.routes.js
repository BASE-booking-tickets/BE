import { Router } from "express";
import {
  createMovie,
  deleteMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
} from "./films.controller.js";
import upload from '../../shared/middlewares/upload.js';

const filmsRouter = Router();

// CREATE movie
filmsRouter.post('/', upload.single('image'), createMovie);
// GET all movies
filmsRouter.get("/", getAllMovies);

// GET movie by id
filmsRouter.get("/:id", getMovieById);

// UPDATE movie
filmsRouter.put("/:id", updateMovie);

// DELETE movie
filmsRouter.delete("/:id", deleteMovie);

export default filmsRouter;
