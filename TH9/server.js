const express = require('express');
const session = require('express-session');

// Import Middlewares
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const testRoutes = require('./routes/testRoutes');

const app = express();

// 1. Cấu hình Global Middlewares
app.use(express.json());
app.use(logger); // Gắn logger cho MỌI request
app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true
}));

// 2. Gắn Routes
app.use('/', authRoutes);
app.use('/students', studentRoutes); // Mọi route trong này tự động có prefix /students
app.use('/', testRoutes);

// 3. Gắn Middleware Xử lý lỗi (Luôn nằm cuối cùng)
app.use(errorHandler);

app.get('/', (req, res) => {
    res.status(200).send("<h1 style='color:blue;'>🚀 Chào mừng đến với API Quản lý Sinh viên!</h1><p>Hãy truy cập /students để xem danh sách.</p>");
});

// 4. Bật Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server Modular chạy tại http://localhost:${PORT}`);
});