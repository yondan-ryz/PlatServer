const express = require("express");
const { readFile, writeFile, deleteFile } = require("./handlers/github");

const app = express();
app.use(express.json());

// Endpoint API
app.get("/api/read", readFile);
app.post("/api/write", writeFile);
app.delete("/api/delete", deleteFile);

// Jalankan server (lokal testing)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app; // Untuk deploy ke Vercel
