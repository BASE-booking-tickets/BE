
export const setupSocketHandlers = (io) => {
    io.on("connection", (socket) => {
        console.log("Người dùng kết nối:", socket.id);

        // 1. Khi người dùng vào trang chọn ghế của một suất chiếu cụ thể
        socket.on("join_showtime", (showtimeId) => {
            socket.join(showtimeId);
            console.log(`User ${socket.id} đã vào phòng suất chiếu: ${showtimeId}`);
        });

        // 2. Khi người dùng Click chọn ghế (Giữ tạm thời)
        socket.on("picking_seat", ({ showtimeId, seatCode, userId }) => {
            // Gửi cho TẤT CẢ mọi người trong phòng đó (trừ người vừa click)
            socket.to(showtimeId).emit("seat_is_being_picked", {
                seatCode,
                userId
            });
        });

        // 3. Khi người dùng Click bỏ chọn ghế
        socket.on("unpicking_seat", ({ showtimeId, seatCode }) => {
            socket.to(showtimeId).emit("seat_is_available", seatCode);
        });

        // 4. Khi người dùng rời khỏi trang (Ngắt kết nối)
        socket.on("disconnect", () => {
            console.log("Người dùng ngắt kết nối:", socket.id);
        });
    });
};

