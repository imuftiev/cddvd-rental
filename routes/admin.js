const express = require('express');
const router = express.Router();
const pool = require('../db');
const { isAdmin } = require('../middleware/auth');

router.get('/users', isAdmin, async (req, res) => {
  const result = await pool.query('SELECT id, name, email, role FROM clients ORDER BY id');
  res.render('admin_users', { users: result.rows });
});

router.post('/users/:id/role', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    await pool.query('UPDATE clients SET role = $1 WHERE id = $2', [role, id]);
    res.redirect('/clients');
  } catch (err) {
    res.status(500).send('Ошибка при обновлении роли: ' + err.message);
  }
});

module.exports = router;
