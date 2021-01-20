const path = require('path');
const express = require('express');
const { check } = require('express-validator');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// const Product = require('../models/Product') // check before activating

// /admin/add-product => GET
router.get( '/add-product', isAuth, adminController.getAddProduct);
// /admin/add-product => GET
router.get( '/products', isAuth, adminController.getProducts);
// /admin/add-product => POST
router.post('/add-product', [
  check('title', 'Title should be at least 3 character long.').isLength({ min: 3}).isString().trim(),
  check('price', 'Price must be a floating number').isFloat(),
  check('description', 'Descripttion can\'t be empty').notEmpty()
], isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post('/edit-product', [
  check('title', 'Title should be at least 3 character long').isLength({ min: 3 }).isString().trim(),
  check('price', 'Please enter valid number').isFloat(),
  check('description', 'Description can not be empty').notEmpty()
], isAuth, adminController.postEditProduct);
router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
