const express = require('express');
const axios = require('axios');
const base64 = require('base-64');
require('dotenv').config();

const app = express();
app.use(express.json());

const GITHUB_API_URL = 'https://api.github.com/repos/yondan-ryz/PlatServer/contents/data.json';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Set your GitHub token in .env file

// Get content from data.json
app.get('/products', async (req, res) => {
  try {
    const response = await axios.get(GITHUB_API_URL, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    });
    const content = base64.decode(response.data.content);
    const data = JSON.parse(content);
    res.json(data.products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch data', error: error.message });
  }
});

// Add a new product
app.post('/products', async (req, res) => {
  try {
    const { id, name, price } = req.body;

    const response = await axios.get(GITHUB_API_URL, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    });

    const content = base64.decode(response.data.content);
    const data = JSON.parse(content);

    data.products.push({ id, name, price });

    const updatedContent = base64.encode(JSON.stringify(data, null, 2));

    await axios.put(GITHUB_API_URL, {
      message: 'Add new product',
      content: updatedContent,
      sha: response.data.sha,
    }, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    });

    res.status(201).json({ message: 'Product added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add product', error: error.message });
  }
});

// Update a product
app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    const response = await axios.get(GITHUB_API_URL, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    });

    const content = base64.decode(response.data.content);
    const data = JSON.parse(content);

    const product = data.products.find((p) => p.id === parseInt(id));
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name = name || product.name;
    product.price = price || product.price;

    const updatedContent = base64.encode(JSON.stringify(data, null, 2));

    await axios.put(GITHUB_API_URL, {
      message: 'Update product',
      content: updatedContent,
      sha: response.data.sha,
    }, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    });

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
});

// Delete a product
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(GITHUB_API_URL, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    });

    const content = base64.decode(response.data.content);
    const data = JSON.parse(content);

    data.products = data.products.filter((p) => p.id !== parseInt(id));

    const updatedContent = base64.encode(JSON.stringify(data, null, 2));

    await axios.put(GITHUB_API_URL, {
      message: 'Delete product',
      content: updatedContent,
      sha: response.data.sha,
    }, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
