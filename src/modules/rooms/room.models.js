import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, default: "2D" }, // Công nghệ phòng chiếu (2D, 3D, IMAX...)
    rows: { type: Number, required: true },
    columns: { type: Number, required: true },
    capacity: { type: Number, required: true },
    seat_layout: { type: Array, default: [] }, // Sẽ được Controller sinh ra
    status: { type: String, enum: ["active", "maintenance"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("ScreenRoom", roomSchema);