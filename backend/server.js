const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = ['http://127.0.0.1:5501', 'http://localhost:5501', 'http://localhost:8080'];
app.use(cors({
  origin: function (origin, callback) {
    console.log('Origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

app.get('/api/proxy', async (req, res) => {
  const fetch = await import('node-fetch');
  const query = req.query.query || 'default';
  const perPage = req.query.perPage || 10;
  const page = req.query.page || 1;

  console.log('Incoming request:', { query, perPage, page, origin: req.get('Origin') });

  const API_KEY = process.env.API_KEY;
  const API_URL = `https://api.unsplash.com/search/photos?query=${query}&client_id=${API_KEY}&per_page=${perPage}&page=${page}`;

  try {
    const response = await fetch.default(API_URL);
    console.log('Unsplash API response status:', response.status);

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error in proxy request:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
