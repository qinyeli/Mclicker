var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/MClicker_db';

var fs = require("fs");
var fileName = "output.csv";

//show all student information
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

//input a phone
var findStudent = function(db, phone, callback) {
  var cursor = db.collection('studentInfo').find({"phone": phone});
  cursor.nextObject(function(err, item) {
    if (item != null) {
      callback(item["name"]);
    }
  });
}

var clearScore = function(db, callback) {
  db.collection('studentInfo').update(
    {},
    {$set: {"score": []}},
    {multi: true},
    function(err, results) {
      callback();
  });
}

//update student name
var updateScore = function(db, phone, score, callback) {
  db.collection('studentInfo').updateOne(
    {"phone": phone},
    {$push: {"score": score}},
    function(err, results) {
      callback();
  });
};

var exportResults = function(db, callback) {
  var cursor = db.collection('studentInfo').find();
  var outputStream = "";
  cursor.each(function(err, doc) {
    assert.equal(err, null);
    if (doc != null) {
      outputStream += doc["name"] + ',' + doc["score"].toString() + '\n';
    } else {
      fs.writeFile(fileName, outputStream, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      });
      callback();
    }
  });
}

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  clearScore(db, function(d){});
  findStudent(db, "7348461740", function(d){
    console.log(d);
  });
  updateScore(db, "110", 1, function(){});
  exportResults(db, function(){});
  showStudents(db, function() {
    db.close();
  });
});
