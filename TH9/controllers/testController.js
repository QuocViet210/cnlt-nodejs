const heavySync = (req, res) => {
    console.log("Bat dau chay Sync...");
    // Giả lập tác vụ nặng chặn luồng (chạy vòng lặp tốn CPU)
    for (let i = 0; i < 3e9; i++) { }
    res.json({ message: "Hoan thanh tac vu Sync!" });
};

const heavyAsync = (req, res) => {
    console.log("Bat dau chay Async...");
    // Giả lập tác vụ nặng nhưng không chặn luồng (ném vào nền)
    setTimeout(() => {
        res.json({ message: "Hoan thanh tac vu Async!" });
    }, 3000);
};

module.exports = { heavySync, heavyAsync };