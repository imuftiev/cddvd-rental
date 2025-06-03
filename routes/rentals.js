const express = require('express');
const router = express.Router();
const pool = require('../db');
const { isAuthenticated } = require('../middleware/auth');

const { isAdmin } = require('../middleware/auth');

router.get('/', isAuthenticated, async (req, res) => {
  const result = await pool.query(`
    SELECT rentals.*, media.title, media.type, clients.name
    FROM rentals
    JOIN media ON media.id = rentals.media_id
    JOIN clients ON clients.id = rentals.client_id
    ORDER BY rent_date DESC
  `);

  res.render('rentals_list', { rentals: result.rows, user: req.session.user });
});

router.post('/:mediaId', isAuthenticated, async (req, res) => {
  const clientId = req.session.user.id;
  const mediaId = req.params.mediaId;
  const actionType = req.query.type;
  const method = req.body.method || 'cash'; // по умолчанию 'cash'

  try {
    const mediaRes = await pool.query('SELECT * FROM media WHERE id = $1', [mediaId]);
    if (mediaRes.rows.length === 0) return res.status(404).send('Фильм не найден');

    const media = mediaRes.rows[0];
    if (media.available_copies <= 0) {
      return res.status(400).send('Нет доступных копий');
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const status = actionType === 'reserve' ? 'reserved' : 'rented';

    const rentalRes = await pool.query(`
      INSERT INTO rentals (client_id, media_id, due_date, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [clientId, mediaId, dueDate, status]);

    const rentalId = rentalRes.rows[0].id;

    await pool.query(`
      UPDATE media SET available_copies = available_copies - 1 WHERE id = $1
    `, [mediaId]);

    if (status === 'rented') {
      await pool.query(`
        INSERT INTO payments (rental_id, amount, method)
        VALUES ($1, $2, $3)
      `, [rentalId, media.price, method]);
    }

    res.redirect('/rentals');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

router.post('/:id/return', isAuthenticated, async (req, res) => {
  const rentalId = req.params.id;

  try {
    const rental = await pool.query('SELECT media_id FROM rentals WHERE id = $1', [rentalId]);

    await pool.query(`
      UPDATE rentals SET status = 'returned', return_date = CURRENT_DATE WHERE id = $1
    `, [rentalId]);

    await pool.query(`
      UPDATE media SET available_copies = available_copies + 1 WHERE id = $1
    `, [rental.rows[0].media_id]);

    res.redirect('/rentals');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при возврате');
  }
});

module.exports = router;
