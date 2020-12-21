const winston = require('winston');
const mongoose = require('mongoose');
const User = require('../models/user');
const PORT = process.env.PORT || 3000;

module.exports = function(app) {
  mongoose.connect('mongodb://127.0.0.1/shop', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
      User.findOne()
        .then(user => {
          if(!user) {
            user = new User({
              name: 'Arthur',
              email: 'art@art.com',
              cart: {
                items: []
              }
            });
            user.save();
          }
        })
      app.listen(PORT, () => console.log(`NodeJS Server connected successfuly on port: ${PORT}`));
      console.log(('MongoDB connected Successfully.'))
    })
    .catch(err => console.error(new Error(err)))
}
