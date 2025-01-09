const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Tambahkan CORS middleware
app.use(cors());

app.get('/github-data', async (req, res) => {
    try {
        const githubToken = process.env.GITHUB_TOKEN;

        if (!githubToken) {
            return res.status(500).send('Token tidak ditemukan di environment variables.');
        }

        const response = await axios.get('https://api.github.com/user/repos', {
            headers: { Authorization: `token ${githubToken}` }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error:', error.response?.status, error.response?.data);
        res.status(error.response?.status || 500).send(error.response?.data || 'Internal Server Error');
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));