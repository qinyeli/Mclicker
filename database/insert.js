var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/MClicker_db';

var fs = require("fs");
var fileName = "data.csv";
var nameList = [];

fs.exists(fileName, function(exists) {
  if (exists) {
    fs.stat(fileName, function(error, stats) {
      fs.open(fileName, "r", function(error, fd) {
        var buffer = new Buffer(stats.size);

        fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
          var data = buffer.toString("utf8", 0, buffer.length);
          var rows = data.split('\n');
          for (var i = 0; i < rows.length; i++) {
            var col = rows[i].split(', ');
            nameList.push({"name":col[0], "phone":col[1], "scores":[]});
          }
          fs.close(fd);
        });
      });
    });
  }
});

var removeall = function(db, callback) {
  db.collection('studentInfo').deleteMany({}, function(err, results){
    callback();
  });
};

var insertNameList = function(db, callback) {
  db.collection('studentInfo').insertMany(nameList, function(err, result) {
    assert.equal(err, null);
    console.log("Insert succeed.");
    callback();
  });
};

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  removeall(db, function(){});
  insertNameList(db, function() {
      db.close();
  });
});