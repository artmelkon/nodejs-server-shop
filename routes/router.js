
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const express = require('express');
const csrf = require('csurf');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const multer = require('multer');

const errorController = require('../controllers/error');
const User = require('../models/user');

module.exports = function(app, MONGODB_URI) {
  const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
  });
  
  const csrfProtection = csrf();
  
  const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
      cb( null, new Date().toISOString() + '-' + file.originalname );
    }
  });

  const fileFilter = (req, file, cb) => {
    if(
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/png' || 
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/tiff'
      ) {
      cb(null, true);
    } else {
      cb(null, false)
    }
  }

  // ejs templating engine
  app.set('view engine', 'ejs');
  app.set('views', 'views');

  // imports
  const adminRoutes = require('./admin');
  const shopRoutes = require('./shop');
  const authRouts = require('./auth');

  app.use(bodyParser.urlencoded({extended: false}));
  app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
  app.use(express.static(path.join(__dirname, '../public')));
  app.use('/images', express.static(path.join(__dirname, '../images')));
  app.use(session({ 
    secret: 'mySecretSession', 
    resave: false, 
    saveUninitialized: false ,
    store: store
  }));

  app.use(csrfProtection);
  app.use(flash());
  app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
  })

  app.use((req, res, next) => {
    if(!req.session.userId) return next();
    User.findById({_id: req.session.userId})
      .then(user => {
       console.log(user)
      if(!user) return next();
       req.user = user;
        next();
      })
      .catch(err => (console.log(err)))
  })

  app.use('/admin', adminRoutes);
  app.use(shopRoutes);
  app.use(authRouts);

  app.get('/500', errorController._500page);
  // 404 not found page
  app.use(errorController._404page);

  app.use((error, req, res, next) => {
    console.log(error)
    res.status(500).render('500', {
      path: '/500',
      docTitle: 'Error 500',
      isAuthenticated: req.session.isLoggedIn
    });
  });
}
