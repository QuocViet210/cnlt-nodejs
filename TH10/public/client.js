// ==========================================
// KHỞI TẠO & KIỂM TRA ĐĂNG NHẬP
// ==========================================
const myName = sessionStorage.getItem('chat_username');
if (!myName) {
    window.location.href = '/'; // Đuổi về trang chủ nếu chưa nhập tên
}

const socket = io();

// Các biến giao diện DOM
const userList = document.getElementById('user-list');
const chatTitle = document.getElementById('chat-title');
const chatBox = document.getElementById('chat-box');
const msgInput = document.getElementById('msg-input');
const btnSend = document.getElementById('btn-send');

// Các biến trạng thái của ứng dụng
let currentReceiverId = null;
let currentReceiverName = null;
let globalChatHistory = {}; // Database lưu trên RAM của Client
let globalUsers = {}; // Danh sách user online
let unreadCounts = {}; // Bộ đếm tin nhắn chưa đọc

// Báo với Server là mình đã vào
socket.emit('join', myName);
chatTitle.innerHTML = `<span class="welcome-text">👋 Xin chào <b>${myName}</b>! Hãy chọn 1 người để trò chuyện.</span>`;

// Lấy toàn bộ lịch sử từ Server khi vừa mở trang
socket.on('load-history', (db) => {
    globalChatHistory = db;
});

// ==========================================
// XỬ LÝ DANH SÁCH USER & BỘ ĐẾM THÔNG BÁO
// ==========================================
socket.on('update-users', (users) => {
    globalUsers = users;
    renderUserList();
});

function renderUserList() {
    userList.innerHTML = '';
    for (let id in globalUsers) {
        if (id !== socket.id) { // Không in chính mình ra danh sách
            const username = globalUsers[id];
            const li = document.createElement('li');

            // Giữ hiệu ứng đang chọn nếu đang chat
            if (currentReceiverId === id) li.classList.add('active');

            const firstLetter = username.charAt(0).toUpperCase();

            // Xử lý bộ đếm tin chưa đọc (Cục đỏ)
            const unreadCount = unreadCounts[username] || 0;
            const badgeHtml = unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : '';

            li.innerHTML = `<div class="avatar">${firstLetter}</div> <span class="name">${username}</span> ${badgeHtml}`;

            // Sự kiện khi click vào người dùng để chat
            li.addEventListener('click', () => {
                currentReceiverId = id;
                currentReceiverName = username;

                // Xóa cục đỏ vì đã đọc tin
                unreadCounts[username] = 0;
                renderUserList();

                // Đổi Header
                chatTitle.innerHTML = `<div class="avatar">${firstLetter}</div> <div class="chat-info">Đang trò chuyện với <b>${currentReceiverName}</b></div>`;
                msgInput.disabled = false;
                btnSend.disabled = false;
                msgInput.focus();

                renderChat();
            });
            userList.appendChild(li);
        }
    }
}

// ==========================================
// XỬ LÝ IN TIN NHẮN RA MÀN HÌNH
// ==========================================
function renderChat() {
    chatBox.innerHTML = '';
    const roomKey = [myName, currentReceiverName].sort().join('_');

    // Đọc trong bộ nhớ xem có lịch sử không, có thì in ra
    if (globalChatHistory[roomKey]) {
        globalChatHistory[roomKey].forEach(msg => {
            const isMe = msg.sender === myName;
            appendMessage(isMe, msg.sender, msg.message, msg.time, msg.id, msg.reaction);
        });
    }
}

function appendMessage(isMe, sender, message, time, msgId, reaction) {
    // 1. Xử lý hiển thị cục cảm xúc nếu đã có
    const reactionHtml = reaction ? `<div class="reaction-badge">${reaction}</div>` : '';

    // 2. HTML Bảng chọn cảm xúc (gọi hàm toàn cục window.sendReaction)
    const reactionMenu = `
        <div class="reaction-menu">
            <span onclick="window.sendReaction('${msgId}', '❤️')">❤️</span>
            <span onclick="window.sendReaction('${msgId}', '😂')">😂</span>
            <span onclick="window.sendReaction('${msgId}', '👍')">👍</span>
        </div>
    `;

    // 3. Ghép thành khối tin nhắn hoàn chỉnh
    const msgHtml = `
        <div class="msg-wrapper ${isMe ? 'me' : 'them'}" id="msg-${msgId}">
            <div class="msg ${isMe ? 'me' : 'them'}">
                ${!isMe ? `<span class="sender">${sender}</span>` : ''}
                <div class="content">${message}</div>
                <span class="time">${time}</span>
                ${reactionHtml}
                ${reactionMenu}
            </div>
        </div>
    `;

    chatBox.innerHTML += msgHtml;
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ==========================================
// GỬI VÀ NHẬN TIN NHẮN REALTIME
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

socket.on('receive-message', (payload) => {
    const roomKey = [payload.sender, payload.receiver].sort().join('_');

    // Lưu ngay vào Database Client
    if (!globalChatHistory[roomKey]) globalChatHistory[roomKey] = [];
    globalChatHistory[roomKey].push(payload);

    // KỊCH BẢN 1: Đang mở đúng người đó -> In luôn ra màn hình
    if (currentReceiverName === payload.sender || currentReceiverName === payload.receiver) {
        const isMe = payload.sender === myName;
        appendMessage(isMe, payload.sender, payload.message, payload.time, payload.id, payload.reaction);
    }
    // KỊCH BẢN 2: Đang không mở chat người đó -> Tăng số lượng tin chưa đọc
    else {
        if (payload.sender !== myName) {
            unreadCounts[payload.sender] = (unreadCounts[payload.sender] || 0) + 1;
            renderUserList();
        }
    }
});

// ==========================================
// XỬ LÝ LOGIC THẢ CẢM XÚC
// ==========================================
window.sendReaction = function (messageId, reaction) {
    const roomKey = [myName, currentReceiverName].sort().join('_');
    socket.emit('react-message', { roomKey, messageId, reaction });
};

socket.on('update-reaction', (data) => {
    const { roomKey, messageId, reaction } = data;

    // 1. Cập nhật vào DB Client
    if (globalChatHistory[roomKey]) {
        const msg = globalChatHistory[roomKey].find(m => m.id === messageId);
        if (msg) msg.reaction = reaction;
    }

    // 2. Gắn cục icon vào giao diện trực tiếp (DOM Manipulation)
    const msgDOM = document.getElementById(`msg-${messageId}`);
    if (msgDOM) {
        let badge = msgDOM.querySelector('.reaction-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'reaction-badge';
            msgDOM.querySelector('.msg').appendChild(badge);
        }
        badge.innerText = reaction;
    }
});

// ==========================================
// TÍNH NĂNG "ĐANG SOẠN TIN..." (DEBOUNCE)
// ==========================================
let typingTimer;
const TYPING_DELAY = 1500; // 1.5 giây ngừng gõ thì sẽ tắt hiệu ứng

// 1. Khi người dùng gõ phím vào ô nhập liệu
msgInput.addEventListener('input', () => {
    if (!currentReceiverId) return; // Chưa chọn ai thì thôi

    // Báo lên Server là MÌNH ĐANG GÕ
    socket.emit('typing', { receiverId: currentReceiverId, isTyping: true });

    // Xóa timer cũ (Kỹ thuật Debounce)
    clearTimeout(typingTimer);

    // Cài đặt Timer mới: Nếu 1.5 giây sau không gõ nữa -> Báo NGỪNG GÕ
    typingTimer = setTimeout(() => {
        socket.emit('typing', { receiverId: currentReceiverId, isTyping: false });
    }, TYPING_DELAY);
});

// 2. Lắng nghe Server báo có BẠN ĐANG GÕ
let typingIndicatorDOM = null; // Lưu giữ thẻ HTML 3 dấu chấm để xóa cho dễ

socket.on('typing-status', (data) => {
    const { sender, isTyping } = data;

    // CHỈ HIỆN HIỆU ỨNG NẾU ĐANG MỞ KHUNG CHAT CỦA ĐÚNG NGƯỜI ĐÓ
    if (currentReceiverName === sender) {
        const infoDiv = document.querySelector('.chat-info');

        if (isTyping) {
            // Cập nhật dòng chữ trên Header
            if (infoDiv) infoDiv.innerHTML = `Đang trò chuyện với <b>${currentReceiverName}</b> <span class="typing-text-header">...đang soạn tin</span>`;

            // Hiện bong bóng 3 dấu chấm (Nếu chưa có)
            if (!typingIndicatorDOM) {
                typingIndicatorDOM = document.createElement('div');
                typingIndicatorDOM.className = 'typing-indicator';
                typingIndicatorDOM.innerHTML = '<span></span><span></span><span></span>';
                chatBox.appendChild(typingIndicatorDOM);
                chatBox.scrollTop = chatBox.scrollHeight; // Cuộn xuống cùng
            }
        } else {
            // Ẩn hiệu ứng khi ngừng gõ
            if (infoDiv) infoDiv.innerHTML = `Đang trò chuyện với <b>${currentReceiverName}</b>`;
            if (typingIndicatorDOM) {
                typingIndicatorDOM.remove();
                typingIndicatorDOM = null; // Xóa sổ
            }
        }
    }
});