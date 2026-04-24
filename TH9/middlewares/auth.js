const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Lỗi 401: Bạn chưa đăng nhập!" });
    }
    next(); // Có thẻ bài (session) thì cho qua
};
module.exports = requireLogin;