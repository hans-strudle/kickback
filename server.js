var http = require('http'),
	fs = require('fs'),
	path = require('path');


var server = {
	baseDir: process.cwd(),
	files: {},
	init: function(dir){
		dir = dir || server.baseDir;
		fs.readdir(dir, function(err, files){
			if (err) throw new Error(err);
			var fileCount = 0;
			files.forEach(function(file, index){
				fs.readFile(dir + path.sep + file, 'utf8', function(err, data){
					if (err) throw new Error(err);
					server.files[file] = data;
					console.log(file, index);
					if (++fileCount > files.length - 1){
						server.run();
					}
				})
			})
		})
	},
	requestHandler: function(request, response){
		console.log(request.url);
		var file = path.parse(request.url).base;
		response.end(server.files[file || 'index.html'] || ''); // serve the file data
	},
	run: function(port){
		port = port || 8080; // default port
		(http.createServer(this.requestHandler)).listen(port, function(){ // set requestHandler and start listen on port
			console.log('Server Running on port: ' + port)
		});
	}
}

module.exports = server;