const express = require('express');
const router = express.Router();
const pool = require('../db');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, async (req, res) => {
  const clientId = req.session.user.id;
  const result = await pool.query(`
    SELECT r.*, m.title, m.type 
    FROM rentals r 
    JOIN media m ON r.media_id = m.id 
    WHERE r.client_id = $1
    ORDER BY r.rent_date DESC
  `, [clientId]);

  res.render('rentals_list', { rentals: result.rows });
});

router.post('/:mediaId', isAuthenticated, async (req, res) => {
  const clientId = req.session.user.id;
  const mediaId = req.params.mediaId;
  const actionType = req.query.type;

  try {
    const media = await pool.query('SELECT available_copies FROM media WHERE id = $1', [mediaId]);
    if (media.rows.length === 0) return res.status(404).send('Фильм не найден');

    if (media.rows[0].available_copies <= 0) {
      return res.status(400).send('Нет доступных копий');
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const status = actionType === 'reserve' ? 'reserved' : 'rented';

    await pool.query(`
      INSERT INTO rentals (client_id, media_id, due_date, status)
      VALUES ($1, $2, $3, $4)
    `, [clientId, mediaId, dueDate, status]);

    await pool.query(`
      UPDATE media SET available_copies = available_copies - 1 WHERE id = $1
    `, [mediaId]);

    res.json({ message: `Фильм успешно ${status === 'rented' ? 'арендован' : 'зарезервирован'}` });
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});


router.post('/:id/return', isAuthenticated, async (req, res) => {
  const rentalId = req.params.id;

  const rental = await pool.query('SELECT media_id FROM rentals WHERE id = $1', [rentalId]);

  await pool.query(`
    UPDATE rentals SET status = 'returned', return_date = CURRENT_DATE WHERE id = $1
  `, [rentalId]);

  await pool.query(`
    UPDATE media SET available_copies = available_copies + 1 WHERE id = $1
  `, [rental.rows[0].media_id]);

  res.redirect('/rentals');
});

module.exports = router;
