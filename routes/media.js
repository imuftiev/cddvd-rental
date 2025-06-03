const express = require('express');
const router = express.Router();
const pool = require('../db');
const { isAdminAndDistr} = require('../middleware/auth');

router.get('/', isAdminAndDistr, async (req, res) => {
  const { title, type, year } = req.query;

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

  query += ' ORDER BY id ASC';

  try {
    const mediaResult = await pool.query(query, params);
    const typesResult = await pool.query('SELECT DISTINCT type FROM media ORDER BY type ASC');
    const yearsResult = await pool.query('SELECT DISTINCT year FROM media ORDER BY year DESC');

    res.render('media_list', {
      media: mediaResult.rows,
      types: typesResult.rows.map(row => row.type),
      years: yearsResult.rows.map(row => row.year),
      query: req.query
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});


router.get('/new', isAdminAndDistr, (req, res) => {
  res.render('media_new');
});

router.post('/new', isAdminAndDistr, async (req, res) => {
  const { title, type, year, price, total_copies, image_url } = req.body;
  try {
    await pool.query(
        'INSERT INTO media (title, type, year, price, total_copies, available_copies, image_url) VALUES ($1, $2, $3, $4, $5, $5, $6)',
        [title, type, year, price, total_copies, image_url]
    );
    res.redirect('/media');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/:id/edit', isAdminAndDistr, async (req, res) => {
  const { id } = req.params;
  try {
    const mediaResult = await pool.query('SELECT * FROM media WHERE id = $1', [id]);
    const typesResult = await pool.query('SELECT DISTINCT type FROM media ORDER BY type ASC');

    res.render('media_edit', {
      media: mediaResult.rows[0],
      types: typesResult.rows.map(row => row.type)
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});


router.post('/:id/edit', isAdminAndDistr, async (req, res) => {
  const { id } = req.params;
  const { title, type, year, price, total_copies, available_copies } = req.body;
  try {
    await pool.query(
      'UPDATE media SET title = $1, type = $2, year = $3, price = $4, total_copies = $5, available_copies = $6 WHERE id = $7',
      [title, type, year, price, total_copies, available_copies, id]
    );
    res.redirect('/media');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/:id/delete', isAdminAndDistr, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM media WHERE id = $1', [id]);
    res.redirect('/media');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
