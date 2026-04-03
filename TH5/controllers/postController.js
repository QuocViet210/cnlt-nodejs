const BlogPost = require('../models/BlogPost');

// 1. Xem danh sách (Trang chủ)
exports.getAllPosts = async (req, res) => {
    const posts = await BlogPost.find({}).sort({ _id: -1 });
    res.render('index', { posts });
};

// 2. Render Form tạo bài viết
exports.createPostForm = (req, res) => {
    res.render('create');
};

// 3. Lưu bài viết mới
exports.storePost = async (req, res) => {
    await BlogPost.create({
        title: req.body.title,
        body: req.body.body
    });
    res.redirect('/');
};

// 4. Render Form sửa bài viết
exports.editPostForm = async (req, res) => {
    const post = await BlogPost.findById(req.params.id);
    res.render('edit', { post });
};

// 5. Cập nhật bài viết
exports.updatePost = async (req, res) => {
    await BlogPost.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body
    });
    res.redirect('/');
};

// 6. Xóa bài viết
exports.deletePost = async (req, res) => {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.redirect('/');
};

// 7. Xem chi tiết
exports.getPostDetail = async (req, res) => {
    const post = await BlogPost.findById(req.params.id);
    res.render('detail', { post });
};