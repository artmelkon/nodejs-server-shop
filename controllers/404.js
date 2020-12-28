exports._404Page = (req, res) => {
  res.render('404', {
    docTitle: '404 - Page Not Found',
    path: '/404',
    isAuthenticated: req.session.isLoggedIn,
    userId: req.userId
  });
}