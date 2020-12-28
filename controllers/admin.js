const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    docTitle: 'Add Product', 
    path: '/admin/add-product',
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
    userId: req.userId
  });
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
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

    res.render('admin/edit-product', {
      docTitle: 'Edit Product', 
      path: '/admin/edit-product',
      editing: editMode,
      product: product,
      isAuthenticated: req.isLoggedIn,
      userId: req.userId
    });
  })
  .catch(err => (console.log(err)));
}

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;

  Product.findById(prodId)
    .then( product => {
      product.title = updatedTitle;
      product.imageUrl = updatedImageUrl;
      product.price = updatedPrice;
      product.description = updatedDesc;
      return product.save();
    })
    .then( result => {
      console.log('Updaed Product!')
      res.redirect('/admin/products');
    })
    .catch(err => console.error(err));
}

exports.getProducts = (req, res, next) => {
  Product.find()
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then( products => {
      console.log(products);
      res.render('admin/products', {
        prods: products,
        docTitle: 'Admin Products',
        path: '/admin/products',
        isAuthenticated: req.isLoggedIn,
        userId: req.userId
      });
    })
    .catch( err => (console.log(err)));
}

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByIdAndRemove(prodId)
  .then( () => {
    console.log('Deleted Product');
    res.redirect('/admin/products');
  })
  .catch( err => (console.log(err)));
}