const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');

// Cấu hình thư mục chứa file tĩnh (HTML, CSS, JS)
app.use(express.static('public'));

// ==========================================
// KHỞI TẠO CƠ SỞ DỮ LIỆU (JSON)
// ==========================================
const dbPath = './data/messages.json';
// Nếu chưa có thư mục 'data' thì tạo mới
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}
// Nếu chưa có file 'messages.json' thì tạo file rỗng
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({}));
}

// Tải lịch sử từ file lên RAM khi khởi động Server
let chatDB = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const users = {}; // Bộ nhớ lưu { socketId: username }

// ==========================================
// XỬ LÝ KẾT NỐI SOCKET.IO
// ==========================================
io.on('connection', (socket) => {
    console.log(`[+] User kết nối: ${socket.id}`);

    // 1. NGƯỜI DÙNG THAM GIA PHÒNG
    socket.on('join', (username) => {
        users[socket.id] = username;
        io.emit('update-users', users); // Báo cho mọi người cập nhật danh sách

        // Gửi Toàn bộ Lịch sử Chat từ Database về cho riêng user này
        socket.emit('load-history', chatDB);
    });

    // 2. NHẬN TIN NHẮN VÀ LƯU VÀO DATABASE
    socket.on('private-message', (data) => {
        const { receiverId, message } = data;

        const senderName = users[socket.id];
        const receiverName = users[receiverId];

        // Tạo khóa phòng chat duy nhất (Sắp xếp theo A-Z)
        const roomKey = [senderName, receiverName].sort().join('_');

        // Đóng gói tin nhắn kèm ID duy nhất
        const payload = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5), // ID tin nhắn
            sender: senderName,
            receiver: receiverName,
            message: message,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            reaction: null // Mặc định chưa có cảm xúc
        };

        // Lưu vào Database trên RAM
        if (!chatDB[roomKey]) {
            chatDB[roomKey] = [];
        }
        chatDB[roomKey].push(payload);

        // Ghi đồng bộ vào ổ cứng (Lưu vĩnh viễn)
        fs.writeFileSync(dbPath, JSON.stringify(chatDB, null, 2));

        // Gửi tin nhắn cho người nhận và trả lại 1 bản cho người gửi
        io.to(receiverId).emit('receive-message', payload);
        socket.emit('receive-message', payload);
    });

    // 3. XỬ LÝ SỰ KIỆN THẢ CẢM XÚC
    socket.on('react-message', (data) => {
        const { roomKey, messageId, reaction } = data;

        if (chatDB[roomKey]) {
            // Tìm đúng tin nhắn đó trong Database
            const msgIndex = chatDB[roomKey].findIndex(m => m.id === messageId);
            if (msgIndex !== -1) {
                // Cập nhật cảm xúc và lưu lại vào file
                chatDB[roomKey][msgIndex].reaction = reaction;
                fs.writeFileSync(dbPath, JSON.stringify(chatDB, null, 2));

                // Phát thông báo cảm xúc mới cho TẤT CẢ mọi người
                io.emit('update-reaction', { roomKey, messageId, reaction });
            }
        }
    });

    // XỬ LÝ TRẠNG THÁI "ĐANG SOẠN TIN"
    socket.on('typing', (data) => {
        const { receiverId, isTyping } = data;
        const senderName = users[socket.id];

        // Chỉ bắn tín hiệu cho đúng cái người đang được nhận tin nhắn
        io.to(receiverId).emit('typing-status', {
            sender: senderName,
            isTyping: isTyping
        });
    });

    // 4. NGƯỜI DÙNG THOÁT
    socket.on('disconnect', () => {
        console.log(`[-] User thoát: ${users[socket.id]}`);
        delete users[socket.id];
        io.emit('update-users', users);
    });
});

const PORT = 3000;
http.listen(PORT, () => {
    console.log(`🚀 Server Realtime chạy tại http://localhost:${PORT}`);
});