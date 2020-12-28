
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const express = require('express');
const User = require('../models/user');
const MongoDBStore = require('connect-mongodb-session')(session);

module.exports = function(app, MONGODB_URI) {
  const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
  });
  
  // ejs templating engine
  app.set('view engine', 'ejs');
  app.set('views', 'views');

  // imports
  const adminRoutes = require('./admin');
  const shopRoutes = require('./shop');
  const authRouts = require('./auth');
  const _404Controller = require('./404');

  app.use(bodyParser.urlencoded({extended: false}));
  app.use(express.static(path.join(__dirname, '../public')));
  app.use(session({ 
    secret: 'mySecretSession', 
    resave: false, 
    saveUninitialized: false ,
    store: store
  }));

  app.use((req, res, next) => {
    console.log(req.session.userId)
    if(!req.session.userId) return next();
    User.findById({_id: req.session.userId})
      .then(user => {
       console.log(user)
       req.user = user;
        next();
      })
      .catch(err => (console.log(err)))
  })

  app.use('/admin', adminRoutes);
  app.use(shopRoutes);
  app.use(authRouts);

  // 404 not found page
  app.use(_404Controller);
}
