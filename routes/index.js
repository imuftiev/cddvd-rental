const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM media WHERE available_copies > 0 ORDER BY title ASC
    `);
    res.render('index', {
      user: req.session.user,
      media: result.rows
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
