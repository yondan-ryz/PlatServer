const axios = require("axios");

const GITHUB_API = "https://api.github.com";
const OWNER = "yondan-ryz"; // Ganti dengan username GitHub Anda
const REPO = "PlatServer"; // Ganti dengan nama repository Anda
const FILE_PATH = "data.json"; // Path file JSON di repository
const TOKEN = "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"; // Token GitHub Anda

// Fungsi untuk membaca file JSON dari GitHub
async function readFile(req, res) {
  try {
    const response = await axios.get(
      `${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    // Decode file content dari base64
    const fileContent = Buffer.from(response.data.content, "base64").toString("utf-8");
    res.json(JSON.parse(fileContent)); // Mengirimkan data JSON
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Fungsi untuk menulis atau memperbarui file JSON di GitHub
async function writeFile(req, res) {
  try {
    const { content } = req.body; // Konten JSON baru
    const fileResponse = await axios.get(
      `${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    const sha = fileResponse.data.sha; // Ambil SHA file untuk update

    // Update file JSON dengan konten baru
    await axios.put(
      `${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        message: "Update JSON file",
        content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
        sha,
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    res.json({ message: "File updated successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Fungsi untuk menghapus file JSON dari GitHub
async function deleteFile(req, res) {
  try {
    const fileResponse = await axios.get(
      `${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    const sha = fileResponse.data.sha; // Ambil SHA file untuk menghapusnya

    // Hapus file JSON dari repository
    await axios.delete(
      `${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
        data: {
          message: "Delete JSON file",
          sha,
        },
      }
    );

    res.json({ message: "File deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  readFile,
  writeFile,
  deleteFile,
};
