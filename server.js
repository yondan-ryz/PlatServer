const express = require("express");
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware untuk membaca JSON body
app.use(cors());  // Izinkan semua permintaan dari domain lain
app.use(express.json());

// Data kendaraan bermotor
const kendaraan = [
  { kode: "AB", wilayah: "Yogyakarta" },
  { kode: "AD", wilayah: "Surakarta (Solo)" },
  { kode: "D", wilayah: "Bandung" },
  { kode: "B", wilayah: "Jakarta" },
  { kode: "N", wilayah: "Malang" },
  { kode: "DK", wilayah: "Bali" },
];

// Endpoint POST untuk mencari kendaraan berdasarkan kode
app.post("/kendaraan", (req, res) => {
  const { kode } = req.body; // Ambil kode dari body request
  if (!kode) {
    return res.status(400).send({ message: "Kode kendaraan harus disertakan!" });
  }

  const hasil = kendaraan.find((k) => k.kode === kode.toUpperCase());
  if (hasil) {
    res.json(hasil);
  } else {
    res.status(404).send({ message: "Kode kendaraan tidak ditemukan!" });
  }
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
