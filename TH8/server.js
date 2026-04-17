const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();

// ==========================================
// 1. CẤU HÌNH THỦ KHO "MULTER"
// ==========================================
const storage = multer.diskStorage({
    // a. Chọn kho chứa (Thư mục uploads)
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    // b. Đặt tên cho file (Chống trùng tên bằng cách ghép thời gian hiện tại)
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

// Khởi tạo biến upload. 
// Chú ý: .single("file") - chữ "file" này phải GIỐNG HỆT thuộc tính name="file" trong thẻ <input> ở HTML
const upload = multer({ storage: storage }).array("many-files", 17);

// ==========================================
// 2. ROUTER HIỂN THỊ GIAO DIỆN
// ==========================================
app.get("/", (req, res) => {
    // Trả về file giao diện master.html cho người dùng
    res.sendFile(path.join(__dirname, "views", "master.html"));
});


// ==========================================
// 3. ROUTER XỬ LÝ KHI BẤM NÚT UPLOAD
// ==========================================
app.post("/upload", (req, res) => {
    // Gọi hàm upload để xử lý file
    upload(req, res, (err) => {
        if (err) {
            console.log("Lỗi:", err);
            return res.send("Lỗi upload: " + err.message);
        }

        // Nếu không có lỗi, file đã nằm an toàn trong thư mục uploads/
        res.send("<h3>Upload thành công rực rỡ!</h3><a href='/'>Quay lại</a>");
    });
});

// ==========================================
// 4. BẬT SERVER
// ==========================================
app.listen(8017, () => {
    console.log("🚀 Server đang chạy tại http://localhost:8017");
});