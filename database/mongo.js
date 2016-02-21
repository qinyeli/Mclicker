var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/MClicker_db';

var fs = require("fs");
var inputFileName = "data.csv";
var outputFileName = "output.csv";

//intialize database
var initialDB = function(callback) {
  var nameList = [];
  fs.exists(inputFileName, function(exists) {
    if (exists) {
      fs.stat(inputFileName, function(error, stats) {
        fs.open(inputFileName, "r", function(error, fd) {
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
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log("Mongo connect error");
    }
    //remove previous database
    db.collection('studentInfo').deleteMany({}, function(err, results){
      if (err) {
        console.log("Mongo delete error");
      }
    });
    //insert name list
    db.collection('studentInfo').insertMany(nameList, function(err, result) {
      if (err) {
        console.log("Mongo insert error");
      }
      db.close();
    });
  });
};

//show all student information
var showStudents = function(callback) {
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log("Mongo connect error");
    }
    var cursor = db.collection('studentInfo').find();
    cursor.each(function(err, doc) {
      if (err) {
        console.log("Mongo find error");
      }
      if (doc != null) {
        console.log(doc["name"] + ' ' + doc["phone"] + ' ' + doc["score"]);
      } else {
        db.close();
      }
    });
  });
};

//input a phone, output student name
var findStudent = function(phone, callback) {
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log("Mongo connect error");
    }
    var cursor = db.collection('studentInfo').find({"phone": phone});
    cursor.nextObject(function(err, item) {
      if (item != null) {
        console.log(item["name"]);
        db.close();
      }
    });
  });
};

//reset student scores
var clearScore = function(callback) {
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log("Mongo connect error");
    }
    db.collection('studentInfo').update(
      {},
      {$set: {"score": []}},
      {multi: true},
      function(err, results) {
        db.close();
    });
  });
};

//update student name
var updateScore = function(phone, score, callback) {
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log("Mongo connect error");
    }
    db.collection('studentInfo').updateOne(
      {"phone": phone},
      {$push: {"score": score}},
      function(err, results) {
        db.close();
    });
  });
};

//export student names and their scores to csv file
var exportResults = function(callback) {
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log("Mongo connect error");
    }
    var cursor = db.collection('studentInfo').find();
    var outputStream = "";
    cursor.each(function(err, doc) {
      if (err) {
        console.log("Mongo find error");
      }
      if (doc != null) {
        outputStream += doc["name"] + ',' + doc["score"].toString() + '\n';
      } else {
        fs.writeFile(outputFileName, outputStream, function(err) {
          if(err) {
            return console.log(err);
          }
          console.log("The file was saved!");
        });
        db.close();
      }
    });
  });
};

//functions to call
//initialDB();
clearScore();
findStudent("110");
updateScore("110", 2);
showStudents();
exportResults();
