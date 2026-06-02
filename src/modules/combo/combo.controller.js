import Combo from "./combo.model.js";

// [POST] Thêm Combo mới (Dành cho Admin)
export const createCombo = async (req, res) => {
    try {
        const { name, description, price, is_active } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn hình ảnh minh họa cho Combo"
            });
        }

        // Bắt mọi trường hợp link ảnh từ Cloudinary trả về
        const imageUrl = req.file.path || req.file.secure_url || req.file.url;

        // Nếu vẫn không tìm thấy link ảnh, báo lỗi và in ra Terminal để debug
        if (!imageUrl) {
            console.log("🚨 [DEBUG UPLOAD] Thông tin file nhận được:", req.file);
            return res.status(400).json({
                success: false,
                message: "Upload ảnh thành công nhưng không lấy được link URL. Vui lòng kiểm tra lại file cấu hình upload.js"
            });
        }

        const newCombo = new Combo({
            name,
            description,
            price,
            image: imageUrl,
            is_active
        });

        const savedCombo = await newCombo.save();

        return res.status(201).json({
            success: true,
            message: "Tạo Combo bắp nước thành công",
            data: savedCombo
        });
    } catch (error) {
        console.error("Lỗi tạo Combo:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// [GET] Lấy danh sách Combo (Có hỗ trợ phân quyền hiển thị)
export const getAllCombos = async (req, res) => {
    try {
        const { isAdmin } = req.query;
        const filter = isAdmin === 'true' ? {} : { is_active: true };

        const combos = await Combo.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: combos
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// [GET] Lấy chi tiết 1 Combo
export const getComboById = async (req, res) => {
    try {
        const { id } = req.params;
        const combo = await Combo.findById(id);

        if (!combo) {
            return res.status(404).json({ success: false, message: "Không tìm thấy Combo" });
        }

        return res.status(200).json({
            success: true,
            data: combo
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// [PUT] Cập nhật Combo (Dành cho Admin)
export const updateCombo = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, is_active } = req.body;

        const updateData = {
            name,
            description,
            price,
            is_active
        };

        // Nếu Admin có chọn thay đổi file ảnh mới
        if (req.file) {
            const imageUrl = req.file.path || req.file.secure_url || req.file.url;

            if (!imageUrl) {
                console.log("🚨 [DEBUG UPLOAD] Thông tin file nhận được:", req.file);
                return res.status(400).json({
                    success: false,
                    message: "Upload ảnh thành công nhưng không lấy được link URL. Vui lòng kiểm tra lại file upload.js"
                });
            }

            updateData.image = imageUrl;
        }

        const updatedCombo = await Combo.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedCombo) {
            return res.status(404).json({ success: false, message: "Không tìm thấy Combo để cập nhật" });
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật Combo thành công",
            data: updatedCombo
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// [DELETE] Xóa Combo (Dành cho Admin)
export const deleteCombo = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCombo = await Combo.findByIdAndDelete(id);

        if (!deletedCombo) {
            return res.status(404).json({ success: false, message: "Không tìm thấy Combo để xóa" });
        }

        return res.status(200).json({
            success: true,
            message: "Xóa Combo thành công"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};