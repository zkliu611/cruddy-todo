const fs = require('fs');
const path = require('path');
const sprintf = require('sprintf-js').sprintf;
const Promise = require('bluebird');

var counter = 0;

// Private helper functions ////////////////////////////////////////////////////

// Zero padded numbers can only be represented as strings.
// If you don't know what a zero-padded number is, read the
// Wikipedia entry on Leading Zeros and check out some of code links:
// https://www.google.com/search?q=what+is+a+zero+padded+number%3F

const zeroPaddedNumber = (num) => {
  return sprintf('%05d', num);
};

const readCounter = (callback) => {
  Promise.promisify(fs.readFile)(exports.counterFile)
    .then((fileData) => {
      callback(null, Number(fileData));
    })
    .catch((err) => {
      callback(null, 0);
    });

  // fs.readFile(exports.counterFile, (err, fileData) => {
  //   if (err) {
  //     callback(null, 0);
  //   } else {
  //     callback(null, Number(fileData));
  //   }
  // });
};

const writeCounter = (count, callback) => {
  var counterString = zeroPaddedNumber(count);
  Promise.promisify(fs.writeFile)(exports.counterFile, counterString)
    .then(()=>{
      callback(null, counterString);
    })
    .catch((err) => {
      callback(err);
    });

  // var counterString = zeroPaddedNumber(count);
  // fs.writeFile(exports.counterFile, counterString, (err) => {
  //   if (err) {
  //     throw ('error writing counter');
  //   } else {
  //     callback(null, counterString);
  //   }
  // });
};

// Public API - Fix this function //////////////////////////////////////////////

exports.getNextUniqueId = (callback) => {
  Promise.promisify(readCounter)()
    .then((success) => {
      let counter = success;
      counter++;
      return Promise.promisify(writeCounter)(counter)
        .then((success) => {
          callback(null, zeroPaddedNumber(counter));
        });
    })
    .catch(err => {
      callback(err);
    });


  // readCounter( (err, success) => {
  //   if (err) {
  //     callback(err);
  //   }
  //   let counter = success;
  //   counter++;
  //   writeCounter(counter, (err, success) => {
  //     if (err) {
  //       callback(err);
  //     }
  //     callback(null, zeroPaddedNumber(counter));
  //   });
  // });
};



// Configuration -- DO NOT MODIFY //////////////////////////////////////////////

exports.counterFile = path.join(__dirname, 'counter.txt');
