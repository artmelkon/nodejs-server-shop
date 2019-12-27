const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const urldb = 'mongodb://localhost:27017';

let _db;

const mongoConnect = callback => {
  MongoClient.connect(urldb, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, (err, client) => {
    if(err) {
      return console.error(err)
    }
    console.log(`Mongo DB connected!`);
    _db = client.db('shop');
    callback(client)
  })
}

const getDb = () => {
  if(_db) {
    return _db;
  }
  throw 'No database found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;