const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const mongoConnect = require('./utils/mongodb_launcher').mongoConnect;
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
  User.findById('5e03f75a70964134f56e1d09')
    .then(user => {
      req.user = new User(user.name, user.email, user.cart, user._id);      
      next();
    })
    .catch(err => (console.log(err)))
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

// 404 not found page
app.use(_404Controller);

// this method used with mongodb module
mongoConnect(() => {
    // console.log(client);
    app.listen(3000)
});
