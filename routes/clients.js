const express = require('express');
const router = express.Router();
const pool = require('../db');
const { isAdmin } = require('../middleware/auth');

router.get('/', isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY id ASC');
    res.render('clients_list', { client: result.rows });
  } catch (err) {
    res.status(500).send(err.message);
  }
});
module.exports = router;