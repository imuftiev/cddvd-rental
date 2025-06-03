const express = require('express');
const router = express.Router();
const pool = require('../db');
const { isAdmin } = require('../middleware/auth');

router.get('/users', isAdmin, async (req, res) => {
  const result = await pool.query('SELECT * FROM clients ORDER BY id');
  res.render('clients_list', { client: result.rows });
});

router.get('/', isAdmin, async (req, res) => {
  const result = await pool.query(`
    SELECT rentals.*, media.title, media.type, clients.name
    FROM rentals
           JOIN media ON media.id = rentals.media_id
           JOIN clients ON clients.id = rentals.client_id
    ORDER BY rent_date DESC
  `);

  res.render('rentals_list', { rentals: result.rows, user: req.session.user });
});

router.post('/:id/return', isAdmin, async (req, res) => {
  const { id } = req.params;
  await pool.query(`
    UPDATE rentals
    SET return_date = NOW(), status = 'returned'
    WHERE id = $1
  `, [id]);

  res.redirect('/rentals');
});

router.post('/users/:id/role', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    await pool.query('UPDATE clients SET role = $1 WHERE id = $2', [role, id]);
    res.redirect('/clients/users');
  } catch (err) {
    res.status(500).send('Ошибка при обновлении роли: ' + err.message);
  }
});

router.get('/users/:id/edit', isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).send('Клиент не найден');
    res.render('client_edit', { client: result.rows[0] });
  } catch (err) {
    res.status(500).send('Ошибка при получении клиента: ' + err.message);
  }
});

router.post('/users/:id/edit', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    await pool.query('UPDATE clients SET name = $1, email = $2 WHERE id = $3', [name, email, id]);
    res.redirect('/clients/users');
  } catch (err) {
    res.status(500).send('Ошибка при обновлении клиента: ' + err.message);
  }
});

router.post('/users/:id/delete', isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM clients WHERE id = $1', [id]);
    res.redirect('/clients/users');
  } catch (err) {
    res.status(500).send('Ошибка при удалении клиента: ' + err.message);
  }
});

module.exports = router;
