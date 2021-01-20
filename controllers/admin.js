const { validationResult } = require('express-validator');
const { error } = require('winston');
const Product = require('../models/product');
const fileHelper = require('../utils/file');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    path: '/admin/add-product',
    docTitle: 'Add Product', 
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if(!image) {
    return res.status(422).render('admin/edit-product', {
      path: '/admin/add-product',
      docTitle: 'Add product',
      editing: false,
      hasEroor: true,
      product: {
        title: title,
        price: price,
        discription: description
      },
      errorMessages: 'Attached file is not an image',
      validationErrors: []
    })
  }

  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      path: '/admin/add-product',
      docTitle: 'Add Product',
      editing: false,
      hasError: true,
      product: {
        title: title,
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
    imageUrl: image.path,
    description: description,
    userId: req.user
  });

  product
    .save()
    .then(result => {
      console.log('Create Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
}

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if(!editMode) return res.redirect('/');

  console.log('edit mode', editMode)

  const prodId = req.params.productId;
  console.log('product', prodId)
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
  .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
   });
}

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const image = req.file;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;

  console.log('image', image)

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

      console.log('product', product)

      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if(image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path
      }
      return product.save()
      .then( result => {
        console.log('Updated Product!');
        res.redirect('/admin/products');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
   });
}

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if(!product) return next(new Error('Product not found'));
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then( () => {
      console.log('DELETED PRODUCT');
      res.status(200).json({
        message: 'Success'
      });
    })
    .catch(err => {
      res.status(500).json({
        message: 'Deleting product failed'
      });
  });
}