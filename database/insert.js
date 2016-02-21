var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/MClicker_db';

var removeall = function(db, callback) {
  db.collection('studentInfo').deleteMany({}, function(err, results){
    callback();
  });
};

var insertDocument = function(db, callback) {
  db.collection('studentInfo').insertMany( [
    {"name" : "shengjie", "phone" : "7348461740", "score" : []},
    {"name" : "nobody", "phone" : "110", "score" : []}
  ], function(err, result) {
    assert.equal(err, null);
    console.log("Insert succeed.");
    callback();
  });
};

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  removeall(db, function(){});
  insertDocument(db, function() {
      db.close();
  });
});