import mongoose from "mongoose";

const savedPaymentMethodSchema = new mongoose.Schema(
  {
    type: { type: String }, // Visa, Momo
    last4: { type: String },
    token: { type: String },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false, // không trả password khi query
    },

    phone: {
      type: String,
    },

    roles: {
      type: [String],
      enum: ["customer", "staff", "admin"],
      default: ["customer"], // 🔥 luôn là customer
    },

    avatar_url: {
      type: String,
    },

    saved_payment_methods: [savedPaymentMethodSchema],
  },
  {
    timestamps: true,
  }
);

const Auth = mongoose.model("Auth", userSchema);
export default Auth;
