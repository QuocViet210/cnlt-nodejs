// Thêm trường isDeleted: false để phục vụ tính năng Soft Delete
let students = [
    { id: 1, name: "Quoc Viet", email: "viet@example.com", age: 21, class: "CNTT1", isDeleted: false },
    { id: 2, name: "Nguyen Van A", email: "a@example.com", age: 20, class: "CNTT2", isDeleted: false },
    { id: 3, name: "Tran Thi B", email: "b@example.com", age: 22, class: "CNTT1", isDeleted: false }
];

module.exports = students;