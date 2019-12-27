const path = require('path');
const express = require('express');
const errorController = require('../controllers/404');
const router = express.Router();

router.use('/', errorController._404Page);

module.exports = router;