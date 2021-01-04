const { validationResult } = require('express-validator/check');
const { error } = require('winston');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  let message = req.flash('error');
  message = message.length > 0 ? message[0] : null;

  res.render('admin/edit-product', {
    docTitle: 'Add Product', 
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.file;
  // const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    // console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      path: '/admin/add-product',
      docTitle: 'Add Product', 
      editing: false,
      hasError: true,
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    })
  }

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });

  product
    .save()
    .then(result => {
      // console.log('Create Product');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
}

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if(!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then( product => {
    if(!product) return res.redirect('/');
    // let message = req.flash('error');
    // message = message.length > 0 ? message[0] : null;

    res.render('admin/edit-product', {
      docTitle: 'Edit Product', 
      path: '/admin/edit-product',
      editing: editMode,
      product: product,
      hasError: false,
      errorMessage: null,
      validationErrors: []
    });
  })
  .catch(err => (console.log(err)));
}

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.image;
  // const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    console.log(errors.array())
    return res.status(422).render('admin/edit-product', {
      path: '/admin/edit-product',
      docTitle: 'Edit Product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    })
  }

  Product.findById(prodId)
    .then( product => {
      if(product.userId.toString() !== req.user._id.toString()) return res.redirect('/');

      product.title = updatedTitle;
      product.imageUrl = updatedImageUrl;
      product.price = updatedPrice;
      product.description = updatedDesc;
      return product.save()
      .then( result => {
        console.log('Updated Product!');
        res.redirect('/admin/products');
      });
    })
    .catch(err => console.error(err));
}

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id})
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then( products => {
      // console.log(products);
      res.render('admin/products', {
        prods: products,
        docTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch( err => (console.log(err)));
}

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({ _id: prodId, userId: req.user._id })
  .then( () => {
    console.log('Deleted Product');
    res.redirect('/admin/products');
  })
  .catch( err => (console.log(err)));
}