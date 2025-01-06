const axios = require("axios");

const GITHUB_API = "https://api.github.com";
const OWNER = "your-username"; // Ganti dengan username GitHub Anda
const REPO = "your-repository"; // Ganti dengan nama repository Anda
const FILE_PATH = "data.json"; // Path file JSON di repository
const TOKEN = "your-github-token"; // Token GitHub Anda

// Baca file JSON
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

    const fileContent = Buffer.from(response.data.content, "base64").toString("utf-8");
    res.json(JSON.parse(fileContent));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Tulis atau update file JSON
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

    const sha = fileResponse.data.sha;

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

// Hapus file JSON
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

    const sha = fileResponse.data.sha;

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
