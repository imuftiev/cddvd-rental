const express = require('express');
const app = express();
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

const indexRoutes = require('./routes/index');
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

app.use(expressLayouts);
app.set('layout', 'layout');
app.set('view engine', 'ejs');

app.use('/media', mediaRoutes);
app.use(authRoutes);
app.use('/', indexRoutes);

app.listen(3000, () => console.log("Server started on http://localhost:3000"));
