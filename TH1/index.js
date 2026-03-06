const http = require('http');

const server = http.createServer((req, res) => {
    // Thiết lập header tiếng Việt
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });

    // Routing cơ bản
    if (req.url === '/') {
        res.end('Trang chủ\nXin chào Node.js');
    } else if (req.url === '/about') {
        res.end('Trang giới thiệu');
    } else if (req.url === '/contact') {
        res.end('Trang liên hệ');
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Không tìm thấy trang');
    }
});

server.listen(3000, () => {
    console.log('Server đang chạy tại http://localhost:3000');
});