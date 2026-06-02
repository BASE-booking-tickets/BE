import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// [QUAN TRỌNG]: Nhớ sửa lại đường dẫn import này sao cho trỏ đúng tới file cấu hình cloudinary của bạn
import cloudinary from '../configs/cloudinary.js'; 

// Cấu hình kho lưu trữ Cloudinary cho Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Sử dụng luôn instance cloudinary đã được config của bạn
  params: {
    folder: 'cinema_combos', // Tên thư mục sẽ được tạo trên Cloudinary để chứa ảnh
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'], // Các định dạng cho phép
  },
});

// Khởi tạo middleware Upload
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn file tối đa 5MB
});

export default upload;