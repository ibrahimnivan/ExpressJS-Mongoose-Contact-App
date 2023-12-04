const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/mydb');


// Menambah 1 data
// const contact1 = new Contact({
//   nama: 'Alfi',
//   nohp: '089765434563',
//   email: 'alfi@gmail.com',
// });

// Simpan ke collection
// contact1.save().then((contact) => console.log(contact))