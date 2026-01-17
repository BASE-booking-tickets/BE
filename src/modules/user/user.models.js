import mongoose from "mongoose";

const { Schema } = mongoose;

// Sub-schema: Phương thức thanh toán đã lưu
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
  { _id: false }
);

// User Schema
const userSchema = new Schema(
  {
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
      select: false, // ❗ Không trả password về frontend
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
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  }
);

// Indexes
userSchema.index({ email: 1 });

// Export model
const User = mongoose.model("User", userSchema);

export default User;
