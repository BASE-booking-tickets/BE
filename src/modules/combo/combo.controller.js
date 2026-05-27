import Combo from "./combo.model.js";

// [POST] Thêm Combo mới (Dành cho Admin)
export const createCombo = async (req, res) => {
  try {
    const { name, description, price, image, is_active } = req.body;

    const newCombo = new Combo({
      name,
      description,
      price,
      image,
      is_active
    });

    const savedCombo = await newCombo.save();

    return res.status(201).json({
      success: true,
      message: "Tạo Combo bắp nước thành công",
      data: savedCombo
    });
  } catch (error) {
    console.error("Lỗi tạo Combo:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// [GET] Lấy danh sách Combo (Có hỗ trợ phân quyền hiển thị)
export const getAllCombos = async (req, res) => {
  try {
    // Nếu Client gọi (người dùng đặt vé), chỉ lấy các combo đang mở bán (is_active: true)
    // Nếu Admin gọi (truyền query ?isAdmin=true), lấy toàn bộ
    const { isAdmin } = req.query;
    const filter = isAdmin === 'true' ? {} : { is_active: true };

    const combos = await Combo.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: combos
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// [GET] Lấy chi tiết 1 Combo
export const getComboById = async (req, res) => {
  try {
    const { id } = req.params;
    const combo = await Combo.findById(id);

    if (!combo) {
      return res.status(404).json({ success: false, message: "Không tìm thấy Combo" });
    }

    return res.status(200).json({
      success: true,
      data: combo
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// [PUT] Cập nhật Combo (Dành cho Admin)
export const updateCombo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedCombo = await Combo.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true } // Trả về data mới và chạy lại validation của Schema
    );

    if (!updatedCombo) {
      return res.status(404).json({ success: false, message: "Không tìm thấy Combo để cập nhật" });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật Combo thành công",
      data: updatedCombo
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// [DELETE] Xóa Combo (Dành cho Admin)
// LƯU Ý: Khuyên dùng update is_active = false thay vì xóa thẳng để tránh lỗi lịch sử hóa đơn cũ
export const deleteCombo = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCombo = await Combo.findByIdAndDelete(id);

    if (!deletedCombo) {
      return res.status(404).json({ success: false, message: "Không tìm thấy Combo để xóa" });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa Combo thành công"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};