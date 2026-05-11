import Movie from "./fimls.models.js";
import { movieCreateSchema, movieUpdateSchema } from "./fimls.schema.js";

/**
 * ======================================================
 * CREATE – Thêm mới phim
 * ======================================================
 */
export const createMovie = async (req, res) => {
  try {
    // 1. Validate dữ liệu đầu vào bằng Zod
    const parsedData = movieCreateSchema.parse(req.body);

    // 2. Kiểm tra trùng Slug (Slug phải là duy nhất)
    const existedMovie = await Movie.findOne({ slug: parsedData.slug });
    if (existedMovie) {
      return res.status(400).json({
        success: false,
        message: "Đường dẫn (Slug) đã tồn tại, vui lòng đổi tên phim hoặc chỉnh sửa slug."
      });
    }

    // 3. Khởi tạo và lưu phim
    const movie = new Movie(parsedData);
    await movie.save();

    // 4. Populate để trả về dữ liệu có tên thể loại ngay lập tức
    const populatedMovie = await Movie.findById(movie._id).populate("genres", "name slug");

    return res.status(201).json({
      success: true,
      message: "Thêm phim mới thành công!",
      data: populatedMovie,
    });
  } catch (error) {
    console.error("LỖI CREATE MOVIE:", error);
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      error: error.errors ? error.errors.map(e => e.message) : error.message,
    });
  }
};

/**
 * ======================================================
 * GET ALL – Lấy danh sách phim (Dùng cho bảng Admin)
 * ======================================================
 */
export const getAllMovies = async (req, res) => {
  try {
    // Populate genres để hiển thị Tag tên thể loại ở Frontend
    const movies = await Movie.find()
      .populate("genres", "name slug")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách phim",
      error: error.message,
    });
  }
};

/**
 * ======================================================
 * GET BY ID – Chi tiết phim
 * ======================================================
 */
export const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id).populate("genres", "name slug description");

    if (!movie) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phim!" });
    }

    return res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "ID phim không hợp lệ",
      error: error.message,
    });
  }
};

/**
 * ======================================================
 * UPDATE – Cập nhật phim
 * ======================================================
 */
export const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate dữ liệu update
    const parsedData = movieUpdateSchema.parse(req.body);

    // 2. Thực hiện cập nhật
    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      { $set: parsedData },
      { new: true, runValidators: true } // Trả về bản ghi mới nhất và chạy kiểm tra schema
    ).populate("genres", "name slug");

    if (!updatedMovie) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phim để cập nhật!" });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật phim thành công",
      data: updatedMovie,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Cập nhật phim thất bại",
      error: error.errors ?? error.message,
    });
  }
};

/**
 * ======================================================
 * DELETE – Xóa phim
 * ======================================================
 */
export const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findByIdAndDelete(id);

    if (!movie) {
      return res.status(404).json({ success: false, message: "Phim không tồn tại hoặc đã bị xóa trước đó." });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa phim thành công!",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Xóa phim thất bại",
      error: error.message,
    });
  }
};