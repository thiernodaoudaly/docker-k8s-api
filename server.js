const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Point de terminaison pour vérifier que l'API fonctionne
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Point de terminaison pour créer un nouvel item
app.post('/items', async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await db.query(
      'INSERT INTO items (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Point de terminaison pour récupérer tous les items
app.get('/items', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM items');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});