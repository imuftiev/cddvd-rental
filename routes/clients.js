  const express = require('express');
  const router = express.Router();
  const pool = require('../db');
  const { isAdmin } = require('../middleware/auth');

  router.get('/users', isAdmin, async (req, res) => {
    const { search } = req.query;
    let query = 'SELECT * FROM clients WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (LOWER(name) LIKE LOWER($1) OR LOWER(email) LIKE LOWER($1))';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY id ASC';

    try {
      const result = await pool.query(query, params);
      res.render('clients_list', { client: result.rows, search });
    } catch (err) {
      res.status(500).send('Ошибка при получении клиентов: ' + err.message);
    }
  });

  router.get('/my', async (req, res) => {
    const userId = req.session.user.id;
    const result = await pool.query(`
      SELECT rentals.*, media.title, media.type
      FROM rentals
      JOIN media ON media.id = rentals.media_id
      WHERE rentals.user_id = $1
      ORDER BY rent_date DESC
    `, [userId]);

    res.render('rentals', { rentals: result.rows, user: req.session.user });
  });


  router.get('/:id/edit', isAdmin, async (req, res) => {
    const clientId = req.params.id;
    try {
      const result = await pool.query('SELECT * FROM clients WHERE id = $1', [clientId]);
      if (result.rows.length === 0) return res.status(404).send('Клиент не найден');
      res.render('client_edit.ejs', { client: result.rows[0] });
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  router.post('/:id/edit', isAdmin, async (req, res) => {
    const clientId = req.params.id;
    const { name, email } = req.body;
    try {
      await pool.query(
          'UPDATE clients SET name = $1, email = $2 WHERE id = $3',
          [name, email, clientId]
      );
      res.redirect('/admin/users');
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  module.exports = router;
