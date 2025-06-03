const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const { title, type, year, status } = req.query;

  let query = 'SELECT * FROM media WHERE 1=1';
  const params = [];

  if (title) {
    params.push(`%${title}%`);
    query += ` AND LOWER(title) LIKE LOWER($${params.length})`;
  }

  if (type) {
    params.push(type);
    query += ` AND type = $${params.length}`;
  }

  if (year) {
    params.push(year);
    query += ` AND year = $${params.length}`;
  }

  query += ' ORDER BY title ASC';

  try {
    const [mediaResult, typesResult, yearsResult] = await Promise.all([
      pool.query(query, params),
      pool.query('SELECT DISTINCT type FROM media ORDER BY type'),
      pool.query('SELECT DISTINCT year FROM media ORDER BY year DESC')
    ]);

    res.render('index', {
      user: req.session.user,
      media: mediaResult.rows,
      query: req.query,
      types: typesResult.rows.map(row => row.type),
      years: yearsResult.rows.map(row => row.year)
    });
  } catch (err) {
    res.status(500).send('Ошибка при загрузке фильмов: ' + err.message);
  }
});

module.exports = router;
