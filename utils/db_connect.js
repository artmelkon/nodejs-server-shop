const winston = require('winston');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;

module.exports = function(app, MONGODB_URI) {
  mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
      app.listen(PORT, () => console.log(`NodeJS Server connected successfuly on port: ${PORT}`));
      console.log(('MongoDB connected Successfully.'))
    })
    .catch(err => console.error(new Error(err)))
}
