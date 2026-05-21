import mongoose from "mongoose";

const showtimeSchema = new mongoose.Schema(
  {
    start_time: {
      type: Date,
      required: true,
    },

    end_time: {
      type: Date,
      required: true,
      expires: 0
    },

    screen_name: {
      type: String,
      required: true,
      trim: true,
    },

    movie_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },

    movie_title: {
      type: String,
      required: true,
    },

    movie_poster: {
      type: String,
      required: true,
    },

    seats_booked: {
      type: [String],
      default: [],
    },

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