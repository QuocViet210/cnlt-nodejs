const errorHandler = (err, req, res, next) => {
    console.error("Lỗi hệ thống:", err.stack);
    res.status(500).json({ message: "Đã xảy ra lỗi trên Server!" });
};
module.exports = errorHandler;