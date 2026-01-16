import mongoose from "mongoose";

const ratingStatsSchema = new mongoose.Schema(
  {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const movieSchema = new mongoose.Schema(
  {
    // ===== Thông tin cơ bản =====
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
    },

    duration_min: {
      type: Number,
      required: true,
    },

    release_date: {
      type: Date,
      required: true,
    },

    // ===== Phân loại =====
    genres: {
      type: [String], // ["Comedy", "Drama"]
      required: true,
    },

    status: {
      type: String,
      enum: ["released", "now_showing", "coming_soon", "ended"],
      default: "coming_soon",
    },

    // ===== Ekip =====
    director: {
      type: String,
    },

    cast: {
      type: [String], // ["Mikey Madison", ...]
    },

    // ===== Hình ảnh =====
    poster_url: {
      type: String,
      required: true,
    },

    banner_url: {
      type: String,
    },

    // ===== Đánh giá =====
    rating_stats: {
      type: ratingStatsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);
const Movie = mongoose.model("Movie", movieSchema);
export default Movie;
