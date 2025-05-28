const express = require('express');
const app = express();
// const videoRoutes = require('./routes/videos');
// const userRoutes = require('./routes/users');
const mediaRoutes = require('./routes/media');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/media', mediaRoutes);

app.set('view engine', 'ejs');

// app.use('/api/videos', videoRoutes);
// app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(3000, () => console.log("Server started on http://localhost:3000"));
