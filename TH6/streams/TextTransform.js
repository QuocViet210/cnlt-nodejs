const { Transform } = require('stream');

class TextTransform extends Transform {
    _transform(chunk, encoding, callback) {
        // Biến đổi chunk (mảnh dữ liệu) thành chữ in hoa
        const upperCaseData = chunk.toString().toUpperCase();
        this.push(upperCaseData);
        callback();
    }
}
module.exports = TextTransform;