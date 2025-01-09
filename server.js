const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.get('/github-data', async (req, res) => {
    const githubToken = process.env.GITHUB_TOKEN;
    const response = await axios.get('https://api.github.com/user/repos', {
        headers: { Authorization: `token ${githubToken}` }
    });
    res.json(response.data);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));