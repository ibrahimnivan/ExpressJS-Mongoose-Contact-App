//Model dalam Mongoose adalah abstraksi tingkat tinggi yang memungkinkan Anda untuk berinteraksi dengan koleksi (collection) di database MongoDB dengan lebih mudah. Model ini mendefinisikan struktur data untuk dokumen-dokumen dalam koleksi tersebut dan menyediakan metode untuk melakukan operasi CRUD (Create, Read, Update, Delete) pada dokumen-dokumen tersebut.

const mongoose = require('mongoose');

const Contact = mongoose.model('Contact', {
  nama: {
    type: String,
    required: true,
  },
  noHP: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  }
});

module.exports = Contact;