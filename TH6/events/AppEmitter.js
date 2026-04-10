const EventEmitter = require('events');
const fs = require('fs');

class AppEmitter extends EventEmitter {
    constructor() {
        super();
        // Khi có sự kiện 'log' bắn ra, hàm này sẽ chạy
        this.on('log', (message) => {
            const time = new Date().toLocaleString('vi-VN');
            const logEntry = `[${time}] ${message}\n`;
            // Ghi thêm vào cuối file log.txt
            fs.appendFile('./data/log.txt', logEntry, (err) => {
                if (err) console.error("Lỗi ghi log:", err);
            });
        });
    }
}
module.exports = AppEmitter;