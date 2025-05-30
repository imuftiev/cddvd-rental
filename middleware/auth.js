function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}

function isAdminAndDistr(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin' || req.session.user && req.session.user.role === 'distr') {
    return next();
  }
  res.status(403).send('Доступ запрещен (только для админа и дистрибьютора)');
}


function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).send('Доступ запрещен (только для админа)');
}

function isDistributor(req, res, next) {
  if (req.session.user?.role === 'distr') return next();
  res.status(403).send('Доступ запрещен (только для дистрибьютора)');
}

module.exports = {
  isAuthenticated,
  isAdmin,
  isDistributor,
  isAdminAndDistr
};