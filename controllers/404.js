exports._404Page = (req, res) => {
  res.render('404', {docTitle: '404 - Page', path: ''})
}