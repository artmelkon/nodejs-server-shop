const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  // const isLoggedIn = req.get('Cookie').split('=')[1] === true;
  console.log(req.session.isLoggedIn);
  res.render('auth/login', {
    path: '/login',
    docTitle: 'User Login',
    isAuthenticated: false
  });
}

exports.postLogin = (req, res, next) => {
  // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly')
  User.findOne({ email: req.body.email })
    .then(user => {
      console.log(user._id)
      req.session.userId = user._id;
      req.session.isLoggedIn = true;
      res.redirect('/');
    })
    .catch(err => console.error(err));
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.error(err);
    res.redirect('/');
  })
}

exports.getRegister = (req, res) => {
  res.render('auth/register', {
    path: '/register',
    docTitle: 'Register',
    isAuthenticated: false
  });
}

exports.postRegister = async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if(user) return res.status(400).send('The user already exists');
  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });

  const result = user.save();
  console.log(result);
  res.redirect('/login');
}