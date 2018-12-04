const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

const Promise = require('bluebird');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  // PROMISE VERSION
  // return Promise.promisify(counter.getNextUniqueId)()
  //   .then(id => {
  //     let fileName = path.join(exports.dataDir, id + '.txt');
  //     return Promise.promisify(fs.writeFile)(fileName, text)
  //       .then(() => {
  //         return { id, text };
  //       });
  //   });

  // CALLBACK VERSION
  counter.getNextUniqueId((err, id) => {
    if (err) {
      throw ('Error: cannot read counter');
    }
    let filename = path.join(exports.dataDir, id + '.txt');
    let time = Date.now();
    let finalContent = { 
      id: id,
      text: text,
      createdAt: time,
      updatedAt: time
    };
    fs.writeFile(filename, JSON.stringify(finalContent), (err) => {
      if (err) {
        throw ('Error: cannot write file');
      }
      callback(null, finalContent);
    });
  });
};

exports.readAll = () => {
  return Promise.promisify(fs.readdir)(path.join(exports.dataDir))
    .then((fileNames) => {
      var result = fileNames.map((fileName) => {
        return Promise.promisify(fs.readFile)(path.join(exports.dataDir, fileName), 'utf8')
          .then((fileContent) => {
            // extract data
            return JSON.parse(fileContent);
            // return {
            //   'id': fileName.replace('.txt', ''),
            //   'text': fileContent
            // };
          });
      });
      return Promise.all(result);
    });
};

exports.readOne = (id, callback) => {
  // PROMISE VERSION
  // return Promise.promisify(fs.readFile)(path.join(exports.dataDir, id + '.txt'), 'utf8')
  //   .then(text => {
  //     return { id, text };
  //   });
  // CALLBACK VERSION
  fs.readFile(path.join(exports.dataDir, id + '.txt'), 'utf8', (err, fileContent) => {
    if (err) {
      return callback(new Error(`No item with id: ${id}`));
    }
    callback(null, JSON.parse(fileContent));
  });
};

exports.update = (id, text, callback) => {
  // return Promise.promisify(exports.readOne)(id)
  //   .then(fileObject => {
  //     return Promise.promisify(fs.writeFile)(path.join(exports.dataDir, fileObject.id + '.txt'), text)
  //       .then(() => {
  //         return { id, text };
  //       });
  // });
  exports.readOne(id, (err, fileObject) => {
    if (err) {
      let errorId = fileObject ? fileObject.id : null;
      return callback(new Error(`No item with id: ${errorId}`));
    }
    fileObject.text = text;
    fileObject.updatedAt = Date.now();
    fs.writeFile(path.join(exports.dataDir, fileObject.id + '.txt'), JSON.stringify(fileObject), (err) => {
      if (err) {
        throw ('Error: cannot write file');
      }
      callback(null, fileObject);
    });
  });
};

exports.delete = (id, callback) => {
  // return Promise.promisify(fs.unlink)(path.join(exports.dataDir, id + '.txt'))
  //   .then(() => {
  //     return ;
  //   });
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
