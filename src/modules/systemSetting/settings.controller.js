import SystemSetting from "./systemSetting.model.js";

// Lấy cấu hình hệ thống hiện tại
export const getSettings = async (req, res) => {
  try {
    let setting = await SystemSetting.findOne();
    
    // Nếu hệ thống chưa từng có cấu hình nào (lần đầu chạy dự án), tự động khởi tạo bản ghi mặc định
    if (!setting) {
      setting = new SystemSetting();
      await setting.save();
    }

    return res.status(200).json({
      success: true,
      message: "Lấy cấu hình hệ thống thành công",
      data: setting,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy cấu hình hệ thống",
      error: error.message,
    });
  }
};

// Cập nhật cấu hình hệ thống
export const updateSettings = async (req, res) => {
  try {
    const data = req.body;

    // Cập nhật bản ghi duy nhất trong bảng, runValidators đảm bảo kiểm tra đúng kiểu dữ liệu của Schema
    const updatedSetting = await SystemSetting.findOneAndUpdate(
      {},
      { $set: data },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Cập nhật cấu hình hệ thống thành công",
      data: updatedSetting,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu cấu hình không hợp lệ",
      error: error.message,
    });
  }
};