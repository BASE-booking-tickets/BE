import Movie from "./fimls.models.js";
import { movieCreateSchema, movieUpdateSchema } from "./fimls.schema.js";

//them moi fim
export const createMovie = async (req, res) => {
  try {
    // 1. Validate body
    const parsedData = movieCreateSchema.parse(req.body);

    // 2. Check slug duplicate
    const existedMovie = await Movie.findOne({ slug: parsedData.slug });
    if (existedMovie) {
      return res.status(400).json({
        message: "Slug already exists",
      });
    }

    // 3. Create movie
    const movie = await Movie.create(parsedData);

    return res.status(201).json({
      message: "Create movie successfully",
      data: movie,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Create movie failed",
      error: error.errors ?? error.message,
    });
  }
};

// lấy danh sách tất cả phim
export const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Get movies successfully",
      data: movies,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Get movies failed",
      error: error.message,
    });
  }
};

// lấy chi tiết phim theo id
export const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    return res.status(200).json({
      message: "Get movie successfully",
      data: movie,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Get movie failed",
      error: error.message,
    });
  }
};

//update fim
export const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;

    //  Validate body
    const parsedData = movieUpdateSchema.parse(req.body);

    //  Check movie exists
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    //  Update
    const updatedMovie = await Movie.findByIdAndUpdate(id, parsedData, {
      new: true,
    });

    return res.status(200).json({
      message: "Update movie successfully",
      data: updatedMovie,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Update movie failed",
      error: error.errors ?? error.message,
    });
  }
};

//xóa
export const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Check movie exists
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    // 2. Delete
    await Movie.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Delete movie successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Delete movie failed",
      error: error.message,
    });
  }
};
