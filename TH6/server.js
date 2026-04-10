const http = require('http');
const fs = require('fs');
const url = require('url');

// Gọi các class 
const AppEmitter = require('./events/AppEmitter');
const TextTransform = require('./streams/TextTransform');
const EchoDuplex = require('./streams/EchoDuplex');

const myEmitter = new AppEmitter();

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    // 1. ROUTE CÁC TRANG GIAO DIỆN CHÍNH (HTML)

    if (path === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream('./views/index.html').pipe(res);
    }
    else if (path === '/events') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream('./views/events.html').pipe(res);
    }
    else if (path === '/request') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream('./views/request.html').pipe(res); // Đã sửa để load file HTML
    }
    else if (path === '/streams') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream('./views/streams.html').pipe(res);
    }

    // 2. XỬ LÝ DỮ LIỆU TỪ CÁC FORM GỬI LÊN

    // Nhận dữ liệu GET từ trang Request
    else if (path === '/request-info') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.write('<h2>Kết quả phân tích Request</h2>');
        res.write(`<p><strong>Method:</strong> ${req.method}</p>`);
        res.write(`<p><strong>URL Gốc:</strong> ${req.url}</p>`);
        res.write(`<p><strong>Dữ liệu Query (Người dùng nhập):</strong> ${JSON.stringify(parsedUrl.query)}</p>`);
        res.write(`<h3>Headers:</h3><pre>${JSON.stringify(req.headers, null, 2)}</pre>`);
        res.end();
    }

    // Yêu cầu Writable Stream: Nhận dữ liệu POST và ghi vào file
    else if (path === '/write-stream' && req.method === 'POST') {
        const writeStream = fs.createWriteStream('./data/output.txt');
        req.on('data', chunk => {
            writeStream.write(chunk);
        });
        req.on('end', () => {
            writeStream.end();
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h3>Đã ghi thành công vào file data/output.txt!</h3><a href="/streams">Quay lại</a>');
        });
    }

    // Yêu cầu Duplex Stream: Vừa đọc từ Form, vừa dội ngược (Echo) lại màn hình
    else if (path === '/duplex-echo' && req.method === 'POST') {
        const echo = new EchoDuplex();
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.write('--- KET QUA TU DUPLEX STREAM (ECHO) ---\n\n');
        req.pipe(echo).pipe(res); // Phép thuật của Stream nằm ở đây
    }

    // 3. CÁC ENDPOINT ĐẶC BIỆT (REST API & EVENTS)
    else if (path === '/json') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Trả về dữ liệu JSON thành công", status: 200 }));
    }
    else if (path === '/image') {
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        fs.createReadStream('./images/test.jpg').pipe(res);
    }
    else if (path === '/event') {
        myEmitter.emit('log', 'Người dùng vừa kích hoạt sự kiện bằng nút bấm!');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h3>Đã kích hoạt sự kiện! Hãy kiểm tra file log.txt</h3><a href="/events">Quay lại</a>');
    }
    else if (path === '/download-log') {
        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Content-Disposition': 'attachment; filename="server-log.txt"'
        });
        fs.createReadStream('./data/log.txt').pipe(res);
    }
    else if (path === '/transform') {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        const transformer = new TextTransform();
        fs.createReadStream('./data/story.txt').pipe(transformer).pipe(res);
    }

    // Nếu người dùng gõ link bậy
    else {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 - Không tìm thấy trang</h1><a href="/">Về Trang chủ</a>');
    }
});

server.listen(3000, () => {
    console.log('🚀 Server thuần đang chạy ở http://localhost:3000');
});