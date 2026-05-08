const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const users = {}; // Lưu danh sách user online

io.on('connection', (socket) => {
    console.log(`[+] User kết nối: ${socket.id}`);

    // 1. User tham gia phòng
    socket.on('join', (username) => {
        users[socket.id] = username;
        io.emit('update-users', users);
    });

    // 2. Chuyển tiếp tin nhắn riêng (Private Chat)
    socket.on('private-message', (data) => {
        const { receiverId, message } = data;
        const senderName = users[socket.id];

        // Đóng gói tin nhắn kèm fromId và toId để Client dễ phân loại
        const payload = {
            sender: senderName,
            message: message,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            fromId: socket.id,
            toId: receiverId
        };

        // Gửi cho người nhận
        io.to(receiverId).emit('receive-message', payload);

        // Trả lại 1 bản cho người gửi
        socket.emit('receive-message', { ...payload, isMe: true });
    });

    // 3. Xử lý khi user thoát
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