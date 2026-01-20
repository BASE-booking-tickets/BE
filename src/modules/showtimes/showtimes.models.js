import mongoose from "mongoose";

const showtimeSchema = new mongoose.Schema(
  {
    // Thời gian bắt đầu chiếu
    start_time: {
      type: Date,
      required: true,
    },

    // Thời gian kết thúc
    end_time: {
      type: Date,
      required: true,
    },

    // Tên phòng chiếu (Phòng 1, Phòng 2...)
    screen_name: {
      type: String,
      required: true,
      trim: true,
    },

    // Tham chiếu đến Movie
    movie_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },

    // Snapshot thông tin phim (để hiển thị nhanh, tránh populate)
    movie_title: {
      type: String,
      required: true,
    },
    movie_poster: {
      type: String,
      required: true,
    },

    // Danh sách ghế đã được đặt
    seats_booked: {
      type: [String], // ví dụ: ["A1", "A2"]
      default: [],
    },

    // Giá vé cơ bản
    base_price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Showtime = mongoose.model("Showtime", showtimeSchema);
export default Showtime;
