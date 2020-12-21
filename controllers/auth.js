exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    docTitle: 'User Login'
  });
}

exports.postLogin = (req, res, next) => {
  req.isLoggedIn = true;
  res.redirect('/');
}