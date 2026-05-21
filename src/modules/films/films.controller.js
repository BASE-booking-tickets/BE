import cloudinary from "../../shared/configs/cloudinary.js";
import Movie from "./fimls.models.js";
import { movieCreateSchema, movieUpdateSchema } from "./fimls.schema.js";


/**
 * ======================================================
 * HELPER: Ép kiểu dữ liệu cho FormData
 * ======================================================
 */
const formatFormData = (body) => {
  if (body.duration_min) {
    body.duration_min = Number(body.duration_min);
  }
  // Nếu chỉ có 1 thể loại được chọn, FormData có thể gửi lên chuỗi thay vì mảng
  if (typeof body.genres === 'string') {
    body.genres = [body.genres];
  }
  return body;
};

/**
 * ======================================================
 * CREATE – Thêm mới phim
 * ======================================================
 */
export const createMovie = async (req, res) => {
  try {
    // 1. Xử lý upload ảnh lên Cloudinary nếu có file
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        folder: "movie_posters", // Đổi tên thư mục tùy ý
      });

      // Gán URL an toàn từ Cloudinary vào body để Zod kiểm tra
      req.body.poster_url = uploadResponse.secure_url;
    }

    // 2. Ép kiểu dữ liệu & Validate bằng Zod
    const formattedBody = formatFormData(req.body);
    const parsedData = movieCreateSchema.parse(formattedBody);

    // 3. Kiểm tra trùng Slug
    const existedMovie = await Movie.findOne({ slug: parsedData.slug });
    if (existedMovie) {
      return res.status(400).json({
        success: false,
        message: "Đường dẫn (Slug) đã tồn tại, vui lòng đổi tên phim hoặc chỉnh sửa slug."
      });
    }

    // 4. Khởi tạo và lưu phim
    const movie = new Movie(parsedData);
    await movie.save();

    // 5. Populate để trả về dữ liệu có tên thể loại ngay lập tức
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
 * GET ALL – Lấy danh sách phim (Giữ nguyên)
 * ======================================================
 */
export const getAllMovies = async (req, res) => {
  try {
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
 * GET BY ID – Chi tiết phim (Giữ nguyên)
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

    // 1. Nếu người dùng có tải lên ảnh mới, thực hiện upload để ghi đè link cũ
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        folder: "movie_posters",
      });

      req.body.poster_url = uploadResponse.secure_url;
    }

    // 2. Ép kiểu dữ liệu & Validate update
    const formattedBody = formatFormData(req.body);
    const parsedData = movieUpdateSchema.parse(formattedBody);

    // 3. Thực hiện cập nhật
    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      { $set: parsedData },
      { new: true, runValidators: true }
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
 * DELETE – Xóa phim (Giữ nguyên)
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