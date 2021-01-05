exports._404page = (req, res) => {
  res.status(404).render('404', {
    path: '/404',
    docTitle: '404 - Page Not Found',
    isAuthenticated: req.session.isLoggedIn,
    // userId: req.userId
  });
}

exports._500page = (req, res) => {
  res.status(500).render('500', {
    path: '/500',
    docTitle: 'Error 500',
    isAuthenticated: req.session.isLoggedIn
  })
}