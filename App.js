const path = require('path');
const express = require('express');
const app = express();

const MONGODB_URI = 'mongodb://127.0.0.1/shop';

require('./routes/router')(app, MONGODB_URI);


// this method used with mongodb module
require('./utils/db_connect')(app, MONGODB_URI);