const bcrypt = require('bcrypt');
const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  // const isLoggedIn = req.get('Cookie').split('=')[1] === true;
  // console.log(req.session.isLoggedIn);
  let message = req.flash('error');
  message = message.length > 0 ? message[0] : null;

  res.render('auth/login', {
    path: '/login',
    docTitle: 'User Login',
    errorMessage: message
  });
}

exports.postLogin = (req, res, next) => {
  // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly')
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then(async user => {
      if(!user) {
        req.flash('error', 'Invalid email.');
        return res.redirect('/login');
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
    docTitle: 'Register',
    errorMessage: message
  });
}

exports.postRegister = async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.cofirmPassword;
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
  res.redirect('/login');
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