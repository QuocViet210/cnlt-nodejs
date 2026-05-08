// ==========================================
// 1. KIỂM TRA ĐĂNG NHẬP TRƯỚC KHI VÀO PHÒNG
// ==========================================
// Lấy tên từ bộ nhớ tạm (do trang index.html lưu vào)
const myName = sessionStorage.getItem('chat_username');

// Nếu không có tên (do user gõ lén link /chat.html) -> Đuổi về trang chủ
if (!myName) {
    window.location.href = '/';
}

// Nếu đã có tên hợp lệ -> Kết nối lên Server
const socket = io();

// Các biến giao diện Chat
const userList = document.getElementById('user-list');
const chatTitle = document.getElementById('chat-title');
const chatBox = document.getElementById('chat-box');
const msgInput = document.getElementById('msg-input');
const btnSend = document.getElementById('btn-send');

let currentReceiverId = null;
let chatHistory = {};

// Vừa load trang xong là TỰ ĐỘNG gửi lệnh join phòng
socket.emit('join', myName);
chatTitle.textContent = `👋 Xin chào ${myName}! Hãy chọn 1 người để bắt đầu.`;

// ==========================================
// 2. CẬP NHẬT DANH SÁCH & CHUYỂN NGƯỜI CHAT
// ==========================================
socket.on('update-users', (users) => {
    userList.innerHTML = '';

    for (let id in users) {
        if (id !== socket.id) {
            const li = document.createElement('li');
            li.textContent = users[id];

            li.addEventListener('click', () => {
                document.querySelectorAll('#user-list li').forEach(el => el.classList.remove('active'));
                li.classList.add('active');

                currentReceiverId = id;
                chatTitle.textContent = `💬 Đang trò chuyện với: ${users[id]}`;
                msgInput.disabled = false;
                btnSend.disabled = false;
                msgInput.focus();

                chatBox.innerHTML = '';
                if (chatHistory[id]) {
                    chatHistory[id].forEach(msgHtml => {
                        chatBox.innerHTML += msgHtml;
                    });
                    chatBox.scrollTop = chatBox.scrollHeight;
                }
            });

            userList.appendChild(li);
        }
    }
});

// ==========================================
// 3. GỬI TIN NHẮN
// ==========================================
btnSend.addEventListener('click', () => {
    const msg = msgInput.value.trim();
    if (msg && currentReceiverId) {
        socket.emit('private-message', {
            receiverId: currentReceiverId,
            message: msg
        });
        msgInput.value = '';
        msgInput.focus();
    }
});

msgInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnSend.click();
});

// ==========================================
// 4. NHẬN TIN NHẮN VÀ LƯU LỊCH SỬ
// ==========================================
socket.on('receive-message', (data) => {
    const { sender, message, time, isMe, fromId, toId } = data;

    const conversationId = isMe ? toId : fromId;

    if (!chatHistory[conversationId]) {
        chatHistory[conversationId] = [];
    }

    const msgHtml = `
        <div class="msg ${isMe ? 'me' : 'them'}">
            <span class="sender">${isMe ? 'Tôi' : sender}</span>
            <div class="content">${message}</div>
            <span class="time">${time}</span>
        </div>
    `;

    chatHistory[conversationId].push(msgHtml);

    if (currentReceiverId === conversationId) {
        chatBox.innerHTML += msgHtml;
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});