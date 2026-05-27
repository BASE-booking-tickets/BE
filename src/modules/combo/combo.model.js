import mongoose from "mongoose";

const comboSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    description: { 
      type: String,
      required: true 
    },
    price: { 
      type: Number, 
      required: true,
      min: 0 
    },
    image: { 
      type: String, 
      required: true 
    }, // Đường dẫn ảnh từ Cloudinary
    is_active: { 
      type: Boolean, 
      default: true 
    } // Trạng thái: Bật (bán) / Tắt (ngừng bán)
  },
  { timestamps: true } // Tự động tạo createdAt và updatedAt
);
const Combo = mongoose.model("Combo", comboSchema);
export default Combo