import jwt from "jsonwebtoken";
import User from "../../modules/user/user.models.js";

export const authMiddleware = async (req, res, next) => {
  try {
    console.log("=== BẮT ĐẦU KIỂM TRA AUTH MIDDLEWARE ===");

    // TRẠM 1
    const authHeader = req.headers.authorization;
    console.log("1. Header Authorization:", authHeader ? authHeader.substring(0, 30) + "..." : "KHÔNG CÓ");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Không có token xác thực" });
    }

    // TRẠM 2
    const token = authHeader.split(" ")[1];
    console.log("2. Token cắt ra được:", token.substring(0, 15) + "...");

    // TRẠM 3
    const decoded = jwt.verify(token, "123456");
    console.log("3. Giải mã thành công. Dữ liệu bên trong:", decoded);

    // TRẠM 4
    const accountId = decoded.userId || decoded.id || decoded._id;
    console.log("4. ID trích xuất từ Token:", accountId);

    // TRẠM 5
    const user = await User.findById(accountId);
    console.log("5. Tìm thấy User trong DB:", user ? user.email : "TÌM KHÔNG RA");

    if (!user) {
      return res.status(401).json({ success: false, message: "User không tồn tại" });
    }

    req.user = { id: user._id, roles: user.roles };
    console.log("=== AUTH VƯỢT ẢI THÀNH CÔNG ===");
    next();

  } catch (error) {
    // NẾU SẬP, IN RA LỖI CHÍNH XÁC
    console.error("🚨 LỖI VĂNG RA TẠI CATCH:", error.name, error.message);

    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
      error: error.message
    });
  }
};