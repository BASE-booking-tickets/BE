import ScreenRoom from "./room.models.js";
import { roomCreateSchema, roomUpdateSchema } from "./room.schema.js";

// Helper sinh layout
const generateSeatLayout = (rows, columns) => {
  const layout = [];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  for (let r = 0; r < rows; r++) {
    for (let c = 1; c <= columns; c++) {
      layout.push({
        id: `${alphabet[r]}-${c}`,
        row: alphabet[r],
        number: c,
        type: 'standard',
        is_hidden: false,
        price_modifier: 0
      });
    }
  }
  return layout;
};

export const createRoom = async (req, res) => {
  try {
    const parsedData = roomCreateSchema.parse(req.body);
    const seat_layout = generateSeatLayout(parsedData.rows, parsedData.columns);

    const room = await ScreenRoom.create({
      ...parsedData,
      capacity: parsedData.rows * parsedData.columns,
      seat_layout
    });


    return res.status(201).json(room); 
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getAllRooms = async (req, res) => {
  try {
    const rooms = await ScreenRoom.find().sort({ createdAt: -1 });
    // Khớp với logic: response.data.data || []
    return res.status(200).json({ data: rooms }); 
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedData = roomUpdateSchema.parse(req.body);

    // Sử dụng findByIdAndUpdate với tham số { new: true } để trả về bản ghi mới nhất
    const updatedRoom = await ScreenRoom.findByIdAndUpdate(
      id,
      { $set: parsedData }, // $set sẽ ghi đè toàn bộ mảng layout mới lên mảng cũ
      { new: true, runValidators: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: "Không tìm thấy phòng" });
    }

    return res.status(200).json(updatedRoom);
  } catch (error) {
    return res.status(400).json({
      message: "Lỗi lưu sơ đồ ghế",
      error: error.message
    });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm phòng theo ID trong database
    const room = await ScreenRoom.findById(id);

    if (!room) {
      return res.status(404).json({
        message: "Không tìm thấy phòng chiếu",
      });
    }

    return res.status(200).json(room); 
  } catch (error) {
    return res.status(400).json({
      message: "Lấy chi tiết phòng thất bại",
      error: error.message,
    });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    await ScreenRoom.findByIdAndDelete(id);
    // Trả về string id để FE dùng: r._id !== action.payload
    return res.status(200).json(id); 
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};