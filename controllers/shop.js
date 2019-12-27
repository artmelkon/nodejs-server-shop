const Product = require('../models/product');
// const Cart = require('../models/cart')

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then( products => {
      res.render('shop/index', {
        prods: products,
        docTitle: 'Shop',
        path: '/',
      }    );
    })
    .catch( err => {
      console.log(err)
    });
}

exports.getProducts = (req, res, next) => {
  // special rendering method from express pointing to file name
  Product.fetchAll()
    .then(products => {
    res.render('shop/product-list', {
      prods: products,
      docTitle: 'All Products',
      path: '/products'
    });
  })
  .catch( err => {
    sole.log(err);
  })
}

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product => {
    res.render('shop/product-detail', { 
      product: product,
      docTitle: product.title,
      path: '/products'
    })
  })
  .catch(err => console.log(err));
}

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then( products => {
      res.render('shop/cart', {
        docTitle: 'Your Cart',
        path: '/cart',
        products: products
      });
    })
    .catch(err => (console.log(err)));
}

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product
    .findById(prodId)
    .then( product => {
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
    path: '/checkout'
  })
}

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .addOrder()
    .then(result => {
      res.redirect('/orders')
    })
    .catch(err => (console.log(err)))
}

exports.getOrders = (req, res, next) => {
  req.user
  .getOrders()
  .then( orders => {
    res.render('shop/orders', {
      docTitle: 'Your Orders',
      path: '/orders',
      orders: orders
    });
  })
}
