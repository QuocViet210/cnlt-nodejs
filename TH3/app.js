const express = require('express');
const app = express();

// cấu hình template engine
app.set('view engine', 'ejs');
app.set('views', './views');
// phục vụ file tĩnh
app.use(express.static('public'));

const items = [
    { id: 1, name: 'Đà Lạt', description: 'Thành phố mộng mơ với khí hậu mát mẻ quanh năm', price: 1500000, hot: true },
    { id: 2, name: 'Nha Trang', description: 'Thành phố biển nổi tiếng với nhiều bãi tắm đẹp', price: 1800000, hot: false },
    { id: 3, name: 'Sa Pa', description: 'Khu du lịch vùng núi với khí hậu se lạnh', price: 2000000, hot: true },
    { id: 4, name: 'Phú Quốc', description: 'Đảo du lịch nổi tiếng ở miền Nam', price: 2500000, hot: false },
    { id: 5, name: 'Đà Nẵng', description: 'Thành phố hiện đại, sạch đẹp và đáng sống', price: 1700000, hot: true }
];

app.get('/', (req, res) => {
    res.render('index', { title: 'Trang chủ' });
});

app.get('/list', (req, res) => {
    res.render('list', { title: 'Danh sách', items: items });
});

app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Liên hệ' });
});

app.get('/detail/:id', (req, res) => {
    const id = parseInt(req.params.id); // Chuyển chuỗi sang số 
    const item = items.find(x => x.id === id); // Tìm phần tử có id tương ứng 

    if (!item) {
        return res.send('Không tìm thấy dữ liệu'); // Nếu không tìm thấy dữ liệu, server trả về thông báo đơn giản 
    }

    res.render('detail', { title: 'Chi tiết', item: item }); // Render file detail.ejs và truyền đối tượng item sang view 
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
