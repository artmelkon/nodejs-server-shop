const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const User = require('./models/user');

const app = express();

// ejs templating engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// imports
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const _404Controller = require('./routes/404');



app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('5fdf9940e80aa99c77778f98')
    .then(user => {
      req.user = user;      
      next();
    })
    .catch(err => (console.log(err)))
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

// 404 not found page
app.use(_404Controller);

// this method used with mongodb module
require('./utils/db_connect')(app);