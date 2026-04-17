const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();

// 🌟 MỞ RỘNG 1: Biến thư mục 'uploads' thành thư mục công khai (Static)
// Giúp người dùng có thể gõ link /uploads/ten-file.jpg để xem ảnh trực tiếp
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Cấu hình lưu trữ 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

// 🌟 MỞ RỘNG 2: Bộ lọc (Filter) chỉ cho phép up ảnh (jpeg, png, gif...)
const imageFilter = (req, file, cb) => {
    // Nếu loại file (mimetype) bắt đầu bằng chữ "image/" thì cho qua
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        // Nếu không phải ảnh, báo lỗi và chặn lại
        cb(new Error("Hệ thống chỉ cho phép tải lên tệp hình ảnh!"), false);
    }
};

// Khởi tạo Multer với các chức năng mở rộng
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 🌟 MỞ RỘNG 3: Giới hạn tối đa 5MB/file
    fileFilter: imageFilter
}).array("many-files", 17);


// Router Trang chủ
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "master.html"));
});

// Router Xử lý Upload
app.post("/upload", (req, res) => {
    upload(req, res, (err) => {
        // 1. Xử lý nếu có lỗi (Ví dụ: file quá to, sai định dạng ảnh)
        if (err) {
            return res.send(`
                <div style="text-align:center; padding: 50px; font-family: sans-serif;">
                    <h2 style="color: #e74c3c;">❌ Lỗi: ${err.message}</h2>
                    <a href="/" style="padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px;">Quay lại</a>
                </div>
            `);
        }

        // 2. Nếu không có ai chọn file nào mà vẫn bấm gửi
        if (!req.files || req.files.length === 0) {
            return res.send("<h2 style='text-align:center;'>Vui lòng chọn ít nhất 1 tệp!</h2>");
        }

        // 🌟 MỞ RỘNG 4: Tạo danh sách các đường link ảnh vừa up để trả về màn hình
        let danhSachLink = req.files.map(file => {
            return `<li style="margin: 10px 0;">
                        <a href="/uploads/${file.filename}" target="_blank" style="color: #2980b9; text-decoration: none; font-weight: bold;">
                            🖼️ Xem ảnh: ${file.originalname}
                        </a>
                    </li>`;
        }).join('');

        // 3. Trả về màn hình thành công đẹp
        res.send(`
            <div style="text-align:center; padding: 50px; font-family: sans-serif; background: #f0f2f5; height: 100vh;">
                <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: inline-block;">
                    <h2 style="color: #2ecc71;">✅ Tải lên thành công ${req.files.length} tệp!</h2>
                    <ul style="list-style: none; padding: 0;">
                        ${danhSachLink}
                    </ul>
                    <br><br>
                    <a href="/" style="padding: 12px 25px; background: #34495e; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Quay lại Trang chủ</a>
                </div>
            </div>
        `);
    });
});

app.listen(8017, () => {
    console.log("🚀 Server SIÊU CẤP đang chạy tại http://localhost:8017");
});