var kickback = require('./server.js')

var dir = process.argv[2];

dir = dir.replace(/\\/g, '/')

var port = parseInt(process.argv[3]) || 8080

kickback.init(dir, function(){
	console.log(kickback.files)
	kickback.run(port);
})