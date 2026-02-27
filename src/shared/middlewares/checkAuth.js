import jwt, { decode } from "jsonwebtoken";
import { JWT_SECRET } from "../configs/dotenvConfig.js";
import User from "../../modules/user/user.models.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Không có token xác thực",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded)
    const user = await User.findById(decoded.userId);
    console.log(user)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User không tồn tại",
      });
    }

    req.user = {
      id: user._id,
      roles: user.roles,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};
