import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./user.models.js";
import {
  changePasswordSchema,
  loginUserSchema,
  registerUserSchema,
  updateUserRoleSchema,
  updateUserSchema,
} from "./user.schema.js";
import { JWT_SECRET } from "../../shared/configs/dotenvConfig.js";
import Booking from "../booking/booking.models.js";

// Helper: tạo JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      roles: user.roles,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
};

// REGISTER
export const register = async (req, res) => {
  try {
    const data = registerUserSchema.parse(req.body);

    const existedUser = await User.findOne({ email: data.email });
    if (existedUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã tồn tại",
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
      ...data,
      password: hashedPassword,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        user,
        accessToken: token,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.errors?.[0]?.message || error.message,
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const data = loginUserSchema.parse(req.body);

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

    const token = generateToken(user);

    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user,
        accessToken: token,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.errors?.[0]?.message || error.message,
    });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Chưa đăng nhập",
      });
    }

    await User.findByIdAndUpdate(req.user.id, {
      refresh_token: null,
    });

    return res.status(200).json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET PROFILE (ME)
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password -refresh_token");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = updateUserSchema.parse(req.body);

    const user = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    }).select("-password -refresh_token");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.errors?.[0]?.message || error.message,
    });
  }
};

//đổi mật khẩu
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = changePasswordSchema.parse(req.body);

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu hiện tại không đúng",
      });
    }

    user.password = await bcrypt.hash(data.newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.errors?.[0]?.message || error.message,
    });
  }
};

// ==============================
// GET MY BOOKINGS – Lịch sử vé của user
// ==============================
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ user_id: userId })
      .populate("showtime_id")
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Lấy lịch sử vé thành công",
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADMIN: UPDATE USER ROLES
export const updateUserRoles = async (req, res) => {
  try {
    const { id } = req.params;

    const data = updateUserRoleSchema.parse(req.body);

    const user = await User.findByIdAndUpdate(
      id,
      { roles: data.roles },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật quyền thành công",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.errors?.[0]?.message || error.message,
    });
  }
};

// ADMIN: GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
