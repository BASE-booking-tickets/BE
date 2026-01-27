import mongoose from "mongoose";

const { Schema } = mongoose;

// =============================
// Sub-schema: Phương thức thanh toán đã lưu
// =============================
const savedPaymentMethodSchema = new Schema(
  {
    type: {
      type: String, // "Visa", "Momo"
      required: true,
      trim: true,
    },
    last4: {
      type: String, // "4242"
      required: true,
      length: 4,
    },
    token: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

// =============================
// User Schema
// =============================
const userSchema = new Schema(
  {
    // ====== THÔNG TIN CƠ BẢN (GIỮ NGUYÊN) ======
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    phone: {
      type: String,
      trim: true,
    },

    roles: {
      type: [String],
      enum: ["customer", "staff", "admin"],
      default: ["customer"],
    },

    saved_payment_methods: {
      type: [savedPaymentMethodSchema],
      default: [],
    },

    avatar_url: {
      type: String,
      default: "",
    },

    // =============================
    // 1️⃣ AUTH / LOGOUT
    // =============================
    refresh_token: {
      type: String,
      select: false, // ❗ không trả về frontend
      default: null,
    },

    last_login_at: {
      type: Date,
    },

    // =============================
    // 2️⃣ QUẢN LÝ TRẠNG THÁI USER
    // =============================
    is_active: {
      type: Boolean,
      default: true, // khóa tài khoản nếu false
    },

    email_verified: {
      type: Boolean,
      default: false,
    },

    // =============================
    // 3️⃣ LỊCH SỬ VÉ / BOOKING
    // =============================
    bookings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Booking", // khớp với Booking model
      },
    ],
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  },
);

// =============================
// Indexes
// =============================
userSchema.index({ email: 1 });

const User = mongoose.model("User", userSchema);
export default User;
