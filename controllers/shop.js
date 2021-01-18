const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 1;

exports.getIndex = (req, res, next) => {
  const page =+ req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then(numberProducts => {
      totalItems = numberProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then( products => {
      res.render('shop/index', {
        prods: products,
        docTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch( err => console.error(err));
}

exports.getProducts = (req, res, next) => {
  // special rendering method from express pointing to file name
  Product.find()
    .then(products => {
      // console.log(products)
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

exports.getCart = (req, res, next) => {
  // console.log('req user', req)
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then( user => {
      const products = user.cart.items;
      // console.log(user.cart.items);
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
      // console.log('cart items', user.cart.items)
      const order = new Order({
        user: {
          name: req.user.name,
          email: req.user.email,
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
      userId: req.session.userId
    });
  })
}
exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if(!order) return next(new Error('No ordere found'));
      if(order.user.userId.toString() !== req.user._id.toString()) return next(new Error('User not authorised'));

      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=${invoiceName}`);
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
    
      pdfDoc.fontSize(22).text('INVOICE', {
        underline: true
      });
      pdfDoc.fontSize(16).text(`Order: ${order._id}`);
      pdfDoc.moveDown();
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc.fontSize(12).text(`Title: ${prod.product.title} - Quantity: ${prod.quantity} x $${prod.product.price}`);
      });
      pdfDoc.fontSize(10).text('--------------------------', {align: 'center'});
      pdfDoc.moveDown();
      pdfDoc.fontSize(18).fillColor('red').text(`Total Price: ${totalPrice}`, { align: 'center'});
      pdfDoc.end();

      // fs.readFile(invoicePath, (err, data) => {
      //   if(err) return next(err);
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader('Content-Disposition', `inline; filename=${invoiceName}`);
      //   // res.setHeader('Content-Disposition', `attachment; filename=${invoiceName}`);
      //   res.send(data);
      // });

      /* http strinming datea with createReadStream */
      // const file = fs.createReadStream(invoicePath);
      // res.setHeader('Content-Type', 'application/pdf');
      // res.setHeader('Content-Disposition', `inline; filename=${invoiceName}`);
      // file.on('open', () => {
      //   file.pipe(res);
      // });
    })
    .catch(err => next(err))
}