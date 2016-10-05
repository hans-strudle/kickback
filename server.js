var http = require('http'),
	fs = require('fs'),
	path = require('path');

var totalFiles;
var fileCount = 0;

function normDir(dir, file){
	var str = '';
	dir.split(path.sep).forEach(function(step, ind){
		if (ind > 0) str += step + '/';
	})
	file = str + file;
	return file;
}

var server = {
	map: {
		'': 'index.html', // base
		404: '404.html'
	},
	customHeaders: {

	},
	ignore: [
		'.git'
	],
	baseDir: process.cwd(),
	files: {},
	initialized: false,
	running: false,
	port: 8080,
	init: function(dir, cb){
		dir = dir || server.baseDir;
		cb = cb || server.run;
		if (typeof dir !== 'string') throw new Error('First argument must be a String');
		if (typeof cb !== 'function') throw new Error('Second argument must be a Function');
		
		server.watch(dir);
		fs.readdir(dir, function(err, files){
			if (err) throw new Error(err);
			totalFiles = (totalFiles || 0) + files.length;
			files.forEach(function(file, index){
				if (server.ignore.indexOf(file) < 0){
					if (!fs.statSync(dir + path.sep + file).isDirectory()){
						fs.readFile(dir + path.sep + file, function(err, data){
							if (err) throw new Error(err);
							
							file = normDir(dir, file);
							
							server.files[file] = data;
							if (++fileCount > totalFiles - 1){
								if (!server.running){
									server.initialized = true;
									cb();
								}
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
		console.log('Request for: ', file);
		if (server.map[file]){
			file = server.map[file];
		}
		if (server.customHeaders[file]){
			for (var header in server.customHeaders[file]){
				response.setHeader(header, server.customHeaders[file][header]);
			}
		}
		response.end(server.files[file] || server.files[server.map[404]]); // serve the file data
	},
	watch: function(dir){
		dir = dir || server.baseDir;
		if (typeof dir !== 'string') throw new Error('Argument must be a string')
		
		fs.watch(dir, function(watcherr, file){
			if (server.ignore.indexOf(normDir(dir, file)) < 0){
				fs.readFile(dir + path.sep + file, function(err, data){
					if (err && err.code == 'ENOENT'){
						console.log("File removed: ", file);
					} else if (err) {
						throw new Error(err);
					} else {
						console.log("File updated: ", file);
					}
					file = normDir(dir, file);
					server.files[file] = data;
				})
			}
		})
	},
	run: function(port){
		port = parseInt(port) || server.port; // default port

		(http.createServer(server.requestHandler)).listen(port, function(){
			// set requestHandler and start listen on port
			server.running = true;
			console.log('Server Running on port: ' + port)
		});
	}
}

module.exports = server;