const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { transport } = require('winston');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: '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'
  }
}));


exports.getLogin = (req, res, next) => {
  // const isLoggedIn = req.get('Cookie').split('=')[1] === true;
  // console.log(req.session.isLoggedIn);
  let message = req.flash('error');
  message = message.length > 0 ? message[0] : null;

  res.render('auth/login', {
    path: '/login',
    docTitle: 'User Login',
    errorMessage: message,
    validationErrors: []
  });
}

exports.postLogin = (req, res, next) => {
  // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly')
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      docTitle: 'Logoin',
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    })
  }
  
  User.findOne({ email: email })
    .then(async user => {
      if(!user) {
        req.flash('error', 'Invalid email.');
        return res.status(400).redirect('/login');
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if(!validPassword) {
        req.flash('error', 'Invalid password')
        return res.redirect('/login');
      }
        req.session.userId = user._id;
        req.session.isLoggedIn = true;
        await req.session.save( err => {
          console.log(err);
          res.redirect('/');
        })
    })
    .catch(err => console.error(err));
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.error(err);
    res.redirect('/login');
  })
}

exports.getRegister = (req, res) => {
  let message = req.flash('error');
  message = message.length > 0 ? message[0] : null;
  res.render('auth/register', {
    path: '/register',
    docTitle: 'Registration',
    errorMessage: message
  });
}

exports.postRegister = async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.cofirmPassword;
  
  const errors = validationResult(req);
  /* validate registration */
  if(!errors.isEmpty()) {
    // console.log(errors.array())
    return res.status(422).render('auth/register', {
      path: '/register',
      docTitle: 'Registration',
      errorMessage: errors.array()[0].msg
    });
  }

  let user = await User.findOne({ email: email });
  if(user) {
    req.flash('error', 'Email exists, please try different email.')
    return res.redirect('/register');
  }
  
  const hashedPassword = await bcrypt.hash(password, 12);
  user = new User({
    name: name,
    email: email,
    password: hashedPassword,
    cart: { items: [] }
  });

  const result = await user.save();
  try{
    res.redirect('/login');
    await transporter.sendMail({
      to: email,
      from: 'arthur@artmelkon.me',
      subject: 'Registraton success.',
      html: '<h1>You Successfully sined up!</h1>'
    });
  }
  catch(err) { console.error.apply(err)}
}

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  message = message.length > 0 ? message[0] : null;

  res.render('auth/reset', {
    path: '/reset',
    docTitle: 'Reset Password',
    errorMessage: message
  });
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if(err) {
      console.error(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    
    User.findOne({ email: req.body.email})
      .then(async user => {
        // console.log(user)
        if(!user) {
          req.flash('error', 'No such account with this email.');
          return res.redirect('/reset');
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 36000000;
        const result = await user.save()
      })
      .then(() => {
        res.redirect('/');
        return transporter.sendMail({
          to: req.body.email,
          from: 'arthur@artmelkon.me',
          subject: 'Reset Password',
          html: `
            <p>You requested a password reset</p>
            <p>Clink this <a href="http://localhost:3000/reset/${token}">link</a> to set new password</p>
          `
        })
      })
      .catch(err => console.log(err))
  })
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: {$gt: Date.now()}
  })
    .then(user => {
      let message = req.flash('error');
      message = message.length > 0 ? message[0] : null;
    
      res.render('auth/new-password', {
        path: '/new-password',
        docTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      })
    })
    .catch(err => console.log(err));
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const passwordToken = req.body.passwordToken;
  const userId = req.body.userId;
  let resetUser;

  User.findOne({ 
    _id: userId,
    resetToken: passwordToken,
    resetTokenExpiration: {$gt: Date.now()}    
  })
  .then(user => {
    resetUser = user;
    return bcrypt.hash(newPassword, 12)
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  })
  .then(() => {
    res.redirect('/login');
  })
  .catch(err => console.error(err))
}
