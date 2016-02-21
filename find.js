var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/MClicker_db';

var showStudents = function(db, callback) {
  var cursor = db.collection('studentInfo').find();
  cursor.each(function(err, doc) {
    assert.equal(err, null);
    if (doc != null) {
      console.log(doc["name"] + ' ' + doc["phone"] + ' ' + doc["score"]);
    } else {
      callback();
    }
  });
};

var findStudent = function(db, phone, callback) {
  var cursor = db.collection('studentInfo').find({"phone": phone});
  cursor.nextObject(function(err, item) {
    if (item != null) {
      console.log(item["name"]);
      return item["name"];
    }
  });
}

var updateScore = function(db, phone, score, callback) {
  db.collection('studentInfo').updateOne(
    {"phone": phone},
    {$set: {"score": score}},
    function(err, results) {
      callback();
  });
};

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  var studentName = findStudent(db, "7348461740", function(){});
  updateScore(db, "110", 2, function(){});
  showStudents(db, function() {
      db.close();
  });
  console.log("student: " + studentName);
});
