var http = require('http'),
	fs = require('fs'),
	path = require('path');

var file_type = 'utf8'
	
var server = {
	map: {
		'': 'index.html', // base
		404: '404.html'
	},
	ignore: [
		'.git'
	],
	baseDir: process.cwd(),
	files: {},
	running: false,
	port: 8080,
	init: function(dir){
		dir = dir || server.baseDir;
		if (!server.running) server.baseDir = dir;
		server.watch(dir);
		fs.readdir(dir, function(err, files){
			if (err) throw new Error(err);
			var fileCount = 0;
			files.forEach(function(file, index){
				if (server.ignore.indexOf(file) < 0){
					console.log(dir + path.sep + file);
					console.log(fs.statSync(dir + path.sep + file).isDirectory())
					if (!fs.statSync(dir + path.sep + file).isDirectory()){
						fs.readFile(dir + path.sep + file, function(err, data){
							if (err) throw new Error(err);
							server.files[file] = data;
							if (++fileCount > files.length - 1){
								if (!server.running) server.run(server.port);
							}
						})
					} else {
						fileCount++;
						server.init(dir + path.sep + file);
					}
				} else {
					fileCount++;
				}
			})
		})
	},
	requestHandler: function(request, response){
		console.log('request');
		console.log(request.url);
		var file = path.parse(request.url).base;
		if (server.map[file]){
			file = server.map[file];
		}
		console.log(file);
		console.log(server.files[file])
		response.end(server.files[file] || server.files[404]); // serve the file data
	},
	watch: function(dir){
		fs.watch(dir, function(err, file){
			console.log('serv', server.baseDir);
			console.log(dir + path.sep + file);
			fs.readFile(dir + path.sep + file, function(err, data){
				console.log(file);
				if (err && err.code == 'ENOENT'){
					console.log("File removed: ", file);
				} else if (err) {
					throw new Error(err);
				}
				console.log(data);
				server.files[file] = data;
				console.log("File added: ", file);
			})
		})
	},
	run: function(port){
		console.log(server.files);
		port = port || 8080; // default port
		(http.createServer(server.requestHandler)).listen(port, function(){ 
			// set requestHandler and start listen on port
			server.running = true;
			console.log('Server Running on port: ' + port)
		});
	}
}

module.exports = server;