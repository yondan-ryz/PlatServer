const express = require("express");
const { readFile, writeFile, deleteFile } = require("./handlers/github"); // Fungsi yang telah Anda buat
const bodyParser = require("body-parser");

const app = express();

// Middleware untuk memparsing JSON request body
app.use(bodyParser.json());

// Rute API untuk membaca file JSON
app.get("/api/data", readFile);

// Rute API untuk menulis/merubah file JSON
app.post("/api/data", writeFile);

// Rute API untuk menghapus file JSON
app.delete("/api/data", deleteFile);

// Jalankan server pada port tertentu (misalnya 3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
