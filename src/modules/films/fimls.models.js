import mongoose from "mongoose";

const ratingStatsSchema = new mongoose.Schema(
  {
    average: { type: Number, default: 0, min: 0, max: 10 },
    count: { type: Number, default: 0 },
  },
  { _id: false }
);

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    duration_min: { type: Number, required: true },
    release_date: { type: Date, required: true },

    // Phân loại: Dùng mảng ObjectId để tham chiếu tới Genre
    genres: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Genre",
        required: true,
      }
    ],

    status: {
      type: String,
      enum: ["released", "now_showing", "coming_soon", "ended"],
      default: "coming_soon",
    },

    director: { type: String },
    cast: { type: [String], default: [] }, // Mặc định là mảng rỗng để tránh lỗi .map ở FE

    poster_url: { type: String, required: true },
    banner_url: { type: String },

    rating_stats: {
      type: ratingStatsSchema,
      default: () => ({}),
    },

    // Thêm trường này nếu bạn muốn lọc phim theo độ tuổi (tùy chọn)
    age_rating: { type: String, default: "P" }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Để hỗ trợ populate tốt hơn
    toObject: { virtuals: true }
  }
);

// Index để tìm kiếm phim nhanh hơn theo tiêu đề
movieSchema.index({ title: 'text' });

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;