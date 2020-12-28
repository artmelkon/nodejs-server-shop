const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  // special rendering method from express pointing to file name
  Product.find()
    .then(products => {
      console.log(products)
      res.render('shop/product-list', {
        prods: products,
        docTitle: 'All Products',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn,
        userId: req.userId
      });
  })
  .catch( err => console.log(err))
}

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product => {
    res.render('shop/product-detail', { 
      product: product,
      docTitle: product.title,
      path: '/products',
      isAuthenticated: req.session.isLoggedIn,
      userId: req.userId
    })
  })
  .catch(err => console.log(err));
}

exports.getIndex = (req, res, next) => {
  Product.find()
    .then( products => {
      res.render('shop/index', {
        prods: products,
        docTitle: 'Shop',
        path: '/',
        isAuthenticated: req.session.isLoggedIn,
        userId: req.userId
      });
    })
    .catch( err => console.log(err));
}

exports.getCart = (req, res, next) => {
  console.log('req user', req)
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then( user => {
      const products = user.cart.items;
      console.log(user.cart.items);
      res.render('shop/cart', {
        docTitle: 'Your Cart',
        path: '/cart',
        products: products,
        isAuthenticated: req.session.isLoggedIn,
        userId: req.userId
      });
    })
    .catch(err => (console.log(err)));
}

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  console.log('prodId', prodId)
  Product.findById(prodId)
    .then( product => {
      console.log('product', product)
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    })
    .catch(err => (console.log(err)));
}


exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteItemFromCart(prodId)
    .then( result => {
      res.redirect('/cart');
    })
    .catch(err => (console.log(err)))
}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    docTitle: 'Checkout',
    path: '/checkout',
    isAuthenticated: req.session.isLoggedIn,
    userId: req.userId
  })
}

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } }
      });
      console.log(user.cart.items)
      const order = new Order({
        user: {
          name: req.session.user.name,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => res.redirect('/orders'))
    .catch(err => console.log(err))
}

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.session.userId })
  .then( orders => {
    res.render('shop/orders', {
      docTitle: 'Your Orders',
      path: '/orders',
      orders: orders,
      isAuthenticated: req.session.isLoggedIn,
      userId: req.userId
    });
  })
}
