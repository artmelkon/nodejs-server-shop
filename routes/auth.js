const express = require('express');
const { check, body } = require('express-validator');
const authController = require('../controllers/auth');
const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login', check('email', 'Enter valid email').isEmail().notEmpty(), authController.postLogin);
router.post('/logout', authController.postLogout);
router.get('/register', authController.getRegister);
router.post('/register',
check('email').isEmail().withMessage('Please enter valid'), 
body('password', 'Password should be minimum 3 character long and alphanuermical').isLength({ min: 3 }).isAlphanumeric(), authController.postRegister);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;