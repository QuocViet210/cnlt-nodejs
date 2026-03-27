const express = require('express');
const mongoose = require('mongoose');
const BlogPost = require('./models/BlogPost');


const app = express();

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

mongoose.connect('mongodb://127.0.0.1:27017/blogDB')
    .then(() => console.log('Kết nối MongoDB thành công'))
    .catch((error) => console.log('Lỗi kết nối MongoDB:', error));


app.get('/', async (req, res) => {
    const posts = await BlogPost.find({});  // Lấy tất cả bài viết
    res.render('index', { posts });         // Gửi dữ liệu sang view
});

app.get('/blogposts/new', (req, res) => {
    res.render('create');
});


app.use(express.urlencoded({ extended: true }));


app.post('/blogposts/store', async (req, res) => {
    console.log(req.body);
    await BlogPost.create({
        title: req.body.title,
        body: req.body.body
    });
    res.redirect('/');
});


app.get('/blogposts/:id', async (req, res) => {
    const post = await BlogPost.findById(req.params.id);  // Tìm theo ID
    res.render('detail', { post });
});


app.listen(3000, () => {
    console.log(' Server đang chạy tại http://localhost:3000');
});