const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

const Promise = require('bluebird');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    if (err) {
      throw ('Error: cannot read counter');
    }
    let filename = path.join(exports.dataDir, id + '.txt');
    fs.writeFile(filename, text, (err) => {
      if (err) {
        throw ('Error: cannot write file');
      }
      callback(null, { id, text });
    });
  });
};

exports.readAll = () => {
  return Promise.promisify(fs.readdir)(path.join(exports.dataDir))
    .then((fileNames) => {
      var result = fileNames.map((fileName) => {
        return Promise.promisify(fs.readFile)(path.join(exports.dataDir, fileName), 'utf8')
          .then((fileContent) => {
            return {'id': fileName.replace('.txt', ''), 'text': fileContent};
          });
      });
      return Promise.all(result);
    });
};

exports.readOne = (id, callback) => {
  var text = items[id];
  fs.readFile(path.join(exports.dataDir, id + '.txt'), 'utf8', (err, text) => {
    if (err) {
      return callback(new Error(`No item with id: ${id}`));
    }
    callback(null, { id, text });
  });
};

exports.update = (id, text, callback) => {
  exports.readOne(id, (err, fileObject) => {
    if (err) {
      let errorId = fileObject ? fileObject.id : null;
      return callback(new Error(`No item with id: ${errorId}`));
    }
    fs.writeFile(path.join(exports.dataDir, fileObject.id + '.txt'), text, (err) => {
      if (err) {
        throw ('Error: cannot write file');
      }
      callback(null, { id, text });
    });
  });
};

exports.delete = (id, callback) => {
  fs.unlink(path.join(exports.dataDir, id + '.txt'), (err) => {
    if (err) {
      return callback(new Error(`No item with id: ${id}`));
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
