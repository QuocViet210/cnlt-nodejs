const { Duplex } = require('stream');

class EchoDuplex extends Duplex {
    _read(size) {
        // Không tự sinh ra dữ liệu, chờ nhận vào
    }
    _write(chunk, encoding, callback) {
        console.log('Duplex nhận được:', chunk.toString());
        this.push(chunk); // Đẩy ngược lại ra stream đọc (Echo)
        callback();
    }

    _final(callback) {
        // Phải đẩy giá trị "null" vào ống để báo hiệu cho màn hình (res) biết là đã hết sạch dữ liệu, kết thúc request đi!
        this.push(null);
        callback();
    }
}
module.exports = EchoDuplex;