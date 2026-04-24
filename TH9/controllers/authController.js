const login = (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === '123456') {
        req.session.user = { username: 'admin' }; // Tạo session
        return res.status(200).json({ message: "Đăng nhập thành công" });
    }
    res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
};

const logout = (req, res) => {
    req.session.destroy();
    res.status(200).json({ message: "Đã đăng xuất" });
};

module.exports = { login, logout };