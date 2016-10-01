var http = require('http'),
	fs = require('fs'),
	path = require('path');

var file_type = 'utf8'
	
var server = {
	map: {
		'': 'index.html' // base
	},
	ignore: [
		'.git'
	],
	baseDir: process.cwd(),
	files: {},
	running: false,
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
							if (file.indexOf('.png') > -1){
								file_type = 'binary';
							} else {
								file_type = 'utf8';
							}
						fs.readFile(dir + path.sep + file, file_type, function(err, data){
							if (err) throw new Error(err);
							server.files[file] = data;
							if (++fileCount > files.length - 1){
								if (!server.running) server.run();
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
		console.log(request.url);
		var file = path.parse(request.url).base;
		if (server.map[file]){
			file = server.map[file];
		}
		if (file.indexOf('.png') > -1){
			response.writeHead(200, {'Content-Type': 'image/png'})
		}
		response.end(server.files[file] || ''); // serve the file data
	},
	watch: function(dir){
		
		fs.watch(dir, function(err, file){
			console.log('serv', server.baseDir);
			console.log(dir + path.sep + file);
			if (file.indexOf('.png') > -1){
				file_type = 'binary';
			} else {
				file_type = 'utf8';
			}
			fs.readFile(dir + path.sep + file, file_type, function(err, data){
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