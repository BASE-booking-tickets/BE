import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerSchema, loginSchema } from "./auth.schema.js";
import User from "../user/user.models.js";

// REGISTER (KHÁCH HÀNG)
export const authRegister = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã tồn tại",
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
      username: data.username,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      roles: ["customer"], // 🔥 luôn là customer
    });

    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          roles: user.roles,
        },
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGIN (KHÁCH HÀNG)
export const authLogin = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await User.findOne({ email: data.email }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Không check role admin/staff
    // Cho phép login dù chỉ là customer

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          roles: user.roles,
        },
        accessToken,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
