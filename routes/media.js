const express = require('express');
const router = express.Router();
const pool = require('../db');
const { isAdmin } = require('../middleware/auth');

router.get('/', isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM media ORDER BY id ASC');
    res.render('media_list', { media: result.rows });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/new', isAdmin, (req, res) => {
  res.render('media_new');
});

router.post('/new', isAdmin, async (req, res) => {
  const { title, type, year, price, total_copies } = req.body;
  try {
    await pool.query(
      'INSERT INTO media (title, type, year, price, total_copies, available_copies) VALUES ($1, $2, $3, $4, $5, $5)',
      [title, type, year, price, total_copies]
    );
    res.redirect('/media');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/:id/edit', isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM media WHERE id = $1', [id]);
    res.render('media_edit', { media: result.rows[0] });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/:id/edit', isAdmin, async (req, res) => {
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

router.post('/:id/delete', isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM media WHERE id = $1', [id]);
    res.redirect('/media');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
