const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController'); // Nhúng Controller vào

// Khai báo các đường dẫn và gọi hàm tương ứng từ Controller
router.get('/', postController.getAllPosts);
router.get('/blogposts/new', postController.createPostForm);
router.post('/blogposts/store', postController.storePost);
router.get('/blogposts/:id/edit', postController.editPostForm);
router.post('/blogposts/:id/update', postController.updatePost);
router.post('/blogposts/:id/delete', postController.deletePost);
router.get('/blogposts/:id', postController.getPostDetail);

module.exports = router; // Xuất router ra để app.js dùng