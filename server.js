var http = require('http');
var fs = require('fs');
	var app = http.createServer(function(req,res){
		fs.readFile(__dirname+'/index.html', function(err,data){
			if (err) {
				res.writeHead(500);
				return res.end('Error hhh');
			}
			else
			{
				res.writeHead(200);
				res.end(data);
			}
		})
	})
	app.listen(3000);
	//var io = require('socket.io')(app);

module.exports = app;
