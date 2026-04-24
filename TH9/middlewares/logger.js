const logger = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next(); // Chạy xong thì cho phép đi tiếp
};
module.exports = logger;