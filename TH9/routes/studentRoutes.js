const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const requireLogin = require('../middlewares/auth');

// Bọc tất cả API Sinh viên bằng requireLogin để bảo vệ
router.use(requireLogin);

// Các API tĩnh (Phải đứng trên)
router.get('/stats', studentController.getStats);
router.get('/stats/class', studentController.getStatsByClass);
router.get('/', studentController.getStudents);
router.post('/', studentController.createStudent);

// Các API động (Phải đứng dưới)
router.get('/:id', studentController.getStudentById);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;