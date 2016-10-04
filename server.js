var http = require('http'),
	fs = require('fs'),
	path = require('path');

var totalFiles;
var fileCount = 0;
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
	init: function(dir, cb){
		dir = dir || server.baseDir;
		cb = cb || server.run;
		server.watch(dir);
		fs.readdir(dir, function(err, files){
			if (err) throw new Error(err);
			totalFiles = (totalFiles || 0) + files.length;
			files.forEach(function(file, index){
				if (server.ignore.indexOf(file) < 0){
					if (!fs.statSync(dir + path.sep + file).isDirectory()){
						fs.readFile(dir + path.sep + file, function(err, data){
							if (err) throw new Error(err);
							var str = '';
							dir.split(path.sep).forEach(function(step, ind){
								if (ind > 0) str += step + '/';
							})
							file = str + file;
							
							server.files[file] = data;
							if (++fileCount > totalFiles - 1){
								if (!server.running) cb();
							}
						})
					} else {
						fileCount++;
						server.init(dir + path.sep + file, cb);
					}
				} else {
					fileCount++;
				}
			})
		})
	},
	requestHandler: function(request, response){
		var file = request.url.replace('/', '');
		console.log('Request for: ', file)
		if (server.map[file]){
			file = server.map[file];
		}
		response.end(server.files[file] || server.files[server.map[404]]); // serve the file data
	},
	watch: function(dir){
		fs.watch(dir, function(err, file){
			fs.readFile(dir + path.sep + file, function(err, data){
				if (err && err.code == 'ENOENT'){
					console.log("File removed: ", file);
				} else if (err) {
					throw new Error(err);
				}
				var str = '';
				dir.split(path.sep).forEach(function(step, ind){
					if (ind > 0) str += step + '/';
				})
				file = str + file;
				server.files[file] = data;
				console.log("File added: ", file);
			})
		})
	},
	start: function(port){
		port = port || 8080; // default port
		(http.createServer(server.requestHandler)).listen(port, function(){
			// set requestHandler and start listen on port
			server.running = true;
			console.log('Server Running on port: ' + port)
		});
	}
}

module.exports = server;