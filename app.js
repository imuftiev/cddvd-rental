const express = require('express');
const app = express();
const session = require('express-session');

const mediaRoutes = require('./routes/media');
const authRoutes = require('./routes/auth');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: '3453454',
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.set('view engine', 'ejs');

app.use('/media', mediaRoutes);
app.use(authRoutes);

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(3000, () => console.log("Server started on http://localhost:3000"));
