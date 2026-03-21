import express from "express";
import { createServer } from "http"; // 1. Thêm dòng này
import { Server } from "socket.io";   // 2. Thêm dòng này
import router from "./src/routes/index.js";
import connectDB from "./src/shared/configs/connectDB.js";
import { HOST, PORT } from "./src/shared/configs/dotenvConfig.js";
import notFoundRequest from "./src/shared/middlewares/notFoundRequest.js";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { setupSocketHandlers } from "./src/shared/utils/socketHandler.js";
import { initCronJobs } from "./src/shared/utils/cronJob.js";

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(morgan("dev"));

// Kết nối Database
connectDB();
initCronJobs();

// Routes
app.use("/", router);

// Middleware lỗi 404 (Để sau các routes)
app.use(notFoundRequest);

// --- CẤU HÌNH SOCKET.IO ĐÚNG CÁCH ---

// 3. Tạo httpServer bao quanh app express
const httpServer = createServer(app);

// 4. Khởi tạo Socket.io với httpServer
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"], // Khớp với cors của app
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 5. Kích hoạt các trình xử lý Socket
setupSocketHandlers(io);

// 6. QUAN TRỌNG: Thay app.listen bằng httpServer.listen
httpServer.listen(PORT, () => {
  console.log(`🚀 Server & Socket đang chạy tại: ${HOST}:${PORT}`);
});