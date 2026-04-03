const express = require('express');
const connectDB = require('./config/db'); // 1. Gọi module Database
const postRoutes = require('./routes/postRoutes'); // 2. Gọi module Routes

const app = express();

// Cấu hình Middleware & View Engine
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Thực thi Kết nối Database
connectDB();

// Sử dụng Routes (Chuyển toàn bộ yêu cầu URL vào postRoutes xử lý)
app.use('/', postRoutes);

// Khởi động Server
app.listen(3000, () => {
    console.log('🚀 Server chạy tại http://localhost:3000');
});