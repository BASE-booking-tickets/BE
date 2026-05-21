import multer from 'multer';

// Lưu trữ file tạm thời trong bộ nhớ (RAM)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn file 5MB
});

export default upload;