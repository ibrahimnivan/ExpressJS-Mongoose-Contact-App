const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const { body, validationResult, check } = require("express-validator");
const methodOverride = require("method-override");

// untuk membuat flash
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

// MONGO
require("./utils/db"); //untuk terkoneksi ke MongoDB
const Contact = require("./model/contact"); // Model

const app = express();
const port = 3000;


//  SETUP METHOD OVERRIDE tipe Form
app.use(methodOverride("_method")); 



// EJS for templating engine
app.set('view engine', 'ejs');

// THIRD-PARTY MIDDLEWARE for layout
app.use(expressLayouts);

// BUILD-IN MIDDLEWARE 
app.use(express.static('public')); //for public staic file 
app.use(express.urlencoded({extended: true})); //digunakan untuk mengurai data formulir yang dikirim



// CONFIGURASI FLASH
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());


// HALAMAN HOME
app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: "Shandika",
      email: "sandhikagalih@gmail.com",
    },
    {
      nama: "Erik Ahmad",
      email: "erikahmad@gmail.com",
    },
    {
      nama: "Doddy Ferdiansyah",
      email: "doddyferdiansyah@gmail.com",
    },
  ];

  res.render("index", {
    layout: "layout/main-layout",
    nama: "Ivan",
    title: "Halaman home",
    mahasiswa,
  });
});



//HALAMAN ABOUT
app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layout/main-layout",
    title: "Halaman about",
  });
});




// HALMAN CONTACT
// HALMAN CONTACT
app.get("/contact", async (req, res) => {
  const contacts = await Contact.find();

  res.render("contact", {
    layout: "layout/main-layout",
    title: "Halaman contact",
    contacts, // dari Contacs.find()
    msg: req.flash("msg"), // pesan saat sudah menambah, menghapus dan mengubah setelah redirect
  });
});


// HALAMAN FORM TAMBAH DATA CONTACT
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Form Tambah Data Contact",
    layout: "layout/main-layout",
  });
});

// PROCESS ACTION untuk mengirim data dari Form add-contact
app.post(
  "/contact",
  [
    body("nama").custom(async (value) => { // custom express-validator
      const duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error("Nama contact sudah digunakan!");
      }
      return true; // katanya ini optional bisa dihapus
    }),
    check("email", "Email tidak valid!").isEmail(),  //check untuk custom 'msg' 'Email tidak valdi'
    check("noHP", "No HP tidak valid").isMobilePhone("id-ID"), // 'noHP' sesuai aattribute name di form html
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Form Tambah Data Contact",
        layout: "layout/main-layout",
        errors: errors.array(), // jika nama, email, noHP error
      });
    } else {
      Contact.insertMany(req.body) // untuk menambah dari form ke MongoDB
        .then((result) => {
          // Send a flash message
          req.flash("msg", "Data contact berhasil ditambahkan!");
          res.redirect("/contact");
        })
        .catch((error) => {
          // Handle the error
          console.error("Error inserting data:", error);
          // You can also send an error flash message or handle the error in another way.
        });
    }
  }
);

// proses delete contact
// app.get('/contact/delete/:nama', async (req, res) => {
//   const contact = await Contact.findOne({ nama: req.params.nama});

//   //jika contact tidak ada (agar tidak sembarang menulis di url)
//   if(!contact) {
//     res.status(404);
//     res.send('404');
//   } else {
//     Contact.deleteOne({_id: contact._id}).then(result => {
//       // kirimkan flash message
//      req.flash('msg', 'Data contact berhasil dihapus!')
//      res.redirect('/contact');
//     });
//   }
// });


// PROSES HAPUS DATA CONTACT
//Secara default, Express hanya mendukung HTTP methods "GET" dan "POST" dalam pengolahan formulir. 
app.delete("/contact", (req, res) => {
  Contact.deleteOne({ nama: req.body.nama }).then((result) => {
    // kirimkan flash message
    req.flash("msg", "Data contact berhasil dihapus!");
    res.redirect("/contact");
  });
});



// HALAMAN FORM UBAH DATA CONTACT
app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render("edit-contact", {
    title: "Form Ubah Data Contact",
    layout: "layout/main-layout",
    contact,
  });
});

// PROSES UBAH DATA
app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ nama: value }); 
      if (value !== req.body.oldNama && duplikat) { //hidden-oldNama agar nama tidak duplikat saat hanya ingin mengedit email/noHP
        throw new Error("Nama contact sudah digunakan!");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("noHP", "No HP tidak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Form Ubah Data Contact",
        layout: "layout/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      Contact.updateOne(
        { _id: req.body._id }, // ubah data berdasarkan id
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            noHP: req.body.noHP,
          },
        }
      ).then((result) => {
        // kirimkan flash message
        req.flash("msg", "Data contact berhasil diubah!");
        res.redirect("/contact");
      });
    }
  }
);


// HALAMAN DETAIL CONTACT
app.get("/contact/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render("detail", {
    layout: "layout/main-layout",
    title: "Halaman Detail Contact",
    contact,
  });
});


//  digunakan untuk MEMULAI SERVER Express dan mengatur server untuk mendengarkan permintaan HTTP pada port yang ditentukan. 
app.listen(port, () => {
  console.log(`Mongo contact app | listening at http://localhost:${port}`);
});
