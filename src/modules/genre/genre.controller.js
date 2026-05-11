import Movie from "../films/fimls.models.js";
import Genre from "./genre.models.js";


// Lấy tất cả thể loại
export const getAllGenres = async (req, res) => {
  try {
    const genres = await Genre.find().sort({ name: 1 });
    return res.status(200).json({
      success: true,
      data: genres,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm thể loại mới
export const createGenre = async (req, res) => {
  try {
    const { name, slug, description } = req.body;

    // Kiểm tra xem tên thể loại đã tồn tại chưa
    const existingGenre = await Genre.findOne({ name });
    if (existingGenre) {
      return res.status(400).json({ success: false, message: "Thể loại này đã tồn tại!" });
    }

    const newGenre = await Genre.create({ name, slug, description });
    return res.status(201).json({
      success: true,
      message: "Thêm thể loại thành công",
      data: newGenre,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Cập nhật thể loại
export const updateGenre = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedGenre = await Genre.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedGenre) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thể loại" });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật thành công",
      data: updatedGenre,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Xóa thể loại
export const deleteGenre = async (req, res) => {
  try {
    const { id } = req.params;

    // KIỂM TRA: Nếu có phim nào đang dùng thể loại này thì không cho xóa
    const movieUsingGenre = await Movie.findOne({ genres: id });
    if (movieUsingGenre) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa thể loại này vì đang có phim thuộc thể loại này!",
      });
    }

    const deletedGenre = await Genre.findByIdAndDelete(id);
    if (!deletedGenre) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thể loại" });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa thể loại thành công",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};