const express = require('express');
const session = require('express-session');
const fs = require('fs');

const app = express();

// ==========================================
// CẤU HÌNH MIDDLEWARE
// ==========================================
app.use(express.json()); // Đọc dữ liệu JSON từ request body

app.use(session({
    secret: 'khoa-bi-mat-cua-truong-dai-hoc-quy-nhon',
    resave: false,
    saveUninitialized: true
}));

// ==========================================
// DỮ LIỆU GIẢ LẬP (Mô phỏng Database)
// ==========================================
let students = [
    { id: 1, name: "Pham Quoc Viet", email: "viet@gmail.com" },
    { id: 2, name: "Nguyen Van A", email: "nva@gmail.com" },
    { id: 3, name: "Tran Thi B", email: "ttb@gmail.com" },
    { id: 4, name: "Le Van C", email: "lvc@gmail.com" }
];

// ==========================================
// BÀI 1 & BÀI 5: QUẢN LÝ SINH VIÊN (CRUD + Phân trang + Tìm kiếm)
// ==========================================

// 1. TÌM KIẾM: GET /students/search?name=... (Phải đặt trên GET /:id)
app.get('/students/search', (req, res) => {
    const keyword = req.query.name;
    if (!keyword) return res.status(400).json({ message: "Vui lòng nhập từ khóa name" });

    const result = students.filter(s => s.name.toLowerCase().includes(keyword.toLowerCase()));
    res.status(200).json(result);
});

// 2. LẤY DANH SÁCH & PHÂN TRANG: GET /students?page=1&limit=2
app.get('/students', (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    if (page && limit) {
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedData = students.slice(startIndex, endIndex);
        return res.status(200).json({
            page: page,
            limit: limit,
            total: students.length,
            data: paginatedData
        });
    }
    res.status(200).json(students);
});

// 3. LẤY CHI TIẾT: GET /students/:id
app.get('/students/:id', (req, res) => {
    const student = students.find(s => s.id === parseInt(req.params.id));
    if (!student) return res.status(404).json({ message: "Không tìm thấy sinh viên" });
    res.status(200).json(student);
});

// 4. THÊM MỚI: POST /students
app.post('/students', (req, res) => {
    const { name, email } = req.body;

    // Validate Dữ liệu
    if (!name || name.trim().length < 2) {
        return res.status(400).json({ message: "Tên không hợp lệ (Phải từ 2 ký tự trở lên)" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: "Email sai định dạng" });
    }
    const isExist = students.find(s => s.email === email);
    if (isExist) {
        return res.status(400).json({ message: "Email đã tồn tại trong hệ thống" });
    }

    // Thêm vào mảng
    const newStudent = {
        id: students.length > 0 ? students[students.length - 1].id + 1 : 1,
        name: name,
        email: email
    };
    students.push(newStudent);
    res.status(201).json({ message: "Thêm thành công", student: newStudent });
});

// 5. CẬP NHẬT: PUT /students/:id
app.put('/students/:id', (req, res) => {
    const index = students.findIndex(s => s.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ message: "Không tìm thấy sinh viên để cập nhật" });

    students[index] = { ...students[index], ...req.body };
    res.status(200).json({ message: "Cập nhật thành công", student: students[index] });
});

// 6. XÓA: DELETE /students/:id
app.delete('/students/:id', (req, res) => {
    const index = students.findIndex(s => s.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ message: "Không tìm thấy sinh viên để xóa" });

    students.splice(index, 1);
    res.status(200).json({ message: "Xóa thành công" });
});


// ==========================================
// BÀI 2: BLOCKING VS NON-BLOCKING
// ==========================================

app.get('/sync', (req, res) => {
    console.log("---- CHẠY SYNC (BLOCKING) ----");
    console.log("1. Bắt đầu đọc file...");
    const data = fs.readFileSync('data.txt', 'utf8');
    console.log("2. Đã đọc xong!");
    res.status(200).send(`<h3>Kết quả đọc Sync:</h3><p>${data}</p>`);
});

app.get('/async', (req, res) => {
    console.log("---- CHẠY ASYNC (NON-BLOCKING) ----");
    console.log("1. Bắt đầu giao việc đọc file cho hệ thống...");
    fs.readFile('data.txt', 'utf8', (err, data) => {
        if (err) return res.status(500).send("Lỗi đọc file");
        console.log("3. Hệ thống báo cáo: Đã đọc xong file!");
        res.status(200).send(`<h3>Kết quả đọc Async:</h3><p>${data}</p>`);
    });
    console.log("2. Server tiếp tục làm việc khác mà không cần chờ file đọc xong...");
});


// ==========================================
// BÀI 3: QUẢN LÝ SESSION (ĐĂNG NHẬP)
// ==========================================

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Kiểm tra tài khoản cứng (admin / 123456)
    if (username === 'admin' && password === '123456') {
        req.session.user = { username: 'admin', role: 'quan_tri_vien' };
        return res.status(200).json({ message: "Đăng nhập thành công!" });
    }
    res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu!" });
});

app.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Lỗi: Bạn chưa đăng nhập!" });
    }
    res.status(200).json({ message: "Chào mừng sếp đã quay lại", profile: req.session.user });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.status(200).json({ message: "Đã đăng xuất và hủy Session thành công!" });
});


// ==========================================
// KHỞI ĐỘNG SERVER
// ==========================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Hệ thống API đang chạy tại http://localhost:${PORT}`);
});