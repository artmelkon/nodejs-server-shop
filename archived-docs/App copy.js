const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// ejs templating module start
app.set('view engine', 'ejs');
app.set('views', 'views');
// ejs templating module end

// pug templating module start
// app.set('view engine', 'pug');
// app.set('views', 'views');
// pug templating module end

// import
const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const _404 = require('./routes/404');
const mongoConnect = require('./utils/mongodb_launcher').mongoConnect;


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.use('/admin', adminData.routes);
app.use(shopRoutes);

// 404 not found page
app.use(_404);

// this method used with mongodb module
mongoConnect(() => {
    // console.log(client);
    app.listen(3000)
});

