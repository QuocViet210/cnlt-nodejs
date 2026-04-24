let students = require('../data/db');

const getStudents = (req, res) => {
    let { name, class: className, sort, page, limit } = req.query;

    // 1. Lọc bỏ các sinh viên đã bị soft delete
    let result = students.filter(s => s.isDeleted === false);

    // 2. Tìm kiếm và Lọc
    if (name) result = result.filter(s => s.name.toLowerCase().includes(name.toLowerCase()));
    if (className) result = result.filter(s => s.class === className);

    // 3. Sắp xếp (sort=age_desc)
    if (sort === 'age_desc') result.sort((a, b) => b.age - a.age);

    // 4. Phân trang
    if (page && limit) {
        page = parseInt(page);
        limit = parseInt(limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedData = result.slice(startIndex, endIndex);

        return res.status(200).json({
            page, limit, total: result.length, data: paginatedData
        });
    }

    res.status(200).json(result);
};

const getStudentById = (req, res) => {
    const student = students.find(s => s.id === parseInt(req.params.id) && !s.isDeleted);
    if (!student) return res.status(404).json({ message: "Không tìm thấy" });
    res.status(200).json(student);
};

const createStudent = (req, res) => {
    const { name, email, age, class: className } = req.body;

    // Validation
    if (!name || name.length < 2) return res.status(400).json({ message: "Tên >= 2 ký tự" });
    if (age < 16 || age > 60) return res.status(400).json({ message: "Tuổi từ 16 - 60" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || students.some(s => s.email === email && !s.isDeleted)) {
        return res.status(400).json({ message: "Email sai hoặc bị trùng" });
    }

    const newStudent = {
        id: students.length ? students[students.length - 1].id + 1 : 1,
        name, email, age, class: className, isDeleted: false
    };
    students.push(newStudent);
    res.status(201).json({ message: "Tạo thành công", data: newStudent });
};

const updateStudent = (req, res) => {
    const index = students.findIndex(s => s.id === parseInt(req.params.id) && !s.isDeleted);
    if (index === -1) return res.status(404).json({ message: "Không tìm thấy" });

    students[index] = { ...students[index], ...req.body };
    res.status(200).json({ message: "Cập nhật thành công", data: students[index] });
};

const deleteStudent = (req, res) => {
    const index = students.findIndex(s => s.id === parseInt(req.params.id) && !s.isDeleted);
    if (index === -1) return res.status(404).json({ message: "Không tìm thấy" });

    // SOFT DELETE: Chỉ đổi cờ, không dùng lệnh splice() để xóa thật
    students[index].isDeleted = true;
    res.status(200).json({ message: "Đã xóa mềm thành công" });
};

// --- PHẦN 5: THỐNG KÊ ---
const getStats = (req, res) => {
    const total = students.length;
    const activeStudents = students.filter(s => !s.isDeleted);
    const activeCount = activeStudents.length;
    const deletedCount = total - activeCount;

    const totalAge = activeStudents.reduce((sum, s) => sum + s.age, 0);
    const averageAge = activeCount > 0 ? (totalAge / activeCount).toFixed(1) : 0;

    res.status(200).json({ total, active: activeCount, deleted: deletedCount, averageAge: parseFloat(averageAge) });
};

const getStatsByClass = (req, res) => {
    const activeStudents = students.filter(s => !s.isDeleted);
    const stats = {};

    activeStudents.forEach(s => {
        if (!stats[s.class]) stats[s.class] = 0;
        stats[s.class]++;
    });

    // Chuyển Object thành Array format theo yêu cầu
    const result = Object.keys(stats).map(className => ({
        class: className,
        count: stats[className]
    }));

    res.status(200).json(result);
};

module.exports = { getStudents, getStudentById, createStudent, updateStudent, deleteStudent, getStats, getStatsByClass };