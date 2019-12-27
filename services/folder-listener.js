// const chokidar = require('chokidar');
// const events = require('events');

// const csv = require('csvtojson');
// const csvFilePath = './woo-orders/orders-export.csv';

// // const convertCsv = csv({ noheaders: true, trim: true });
// csv()
//     .fromFile(csvFilePath)
//     .then( jsonArrayObj => {
//         console.log(jsonArrayObj);
//     });

// const watcher = chokidar.watch('./woo-orders/*.csv', {
//     ignored: /(^|[\/\\])\../, // ignore dotfiles
//     persistent: true
// });

// // add event listener
// watcher
//     .on( 'add', path => { console.log(`File ${path} has been added`)})
//     .on( 'change', path => { console.log(`File ${path} has been`)})
//     .on( 'unlink', path => { console.log(`Fifle ${path} has been removed`)});

//     // more useful events
// watcher
//     .on( 'error', error => { console.log(`Watcher ${error}`)});

// watcher.add('./woo-orders/new-file.txt');

// function helloStr() { console.log('Hello World!')}
