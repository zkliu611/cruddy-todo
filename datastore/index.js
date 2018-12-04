const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

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

exports.readAll = (callback) => {
  var data = [];
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      throw ('Error: cannot read files');
    }
    files.forEach((file) => {
      data.push({ id: file.replace('.txt', ''), text: file.replace('.txt', '') });
    });
    callback(null, data);
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
  var item = items[id];
  delete items[id];
  if (!item) {
    // report an error if item not found
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback();
  }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
