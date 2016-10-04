var kickback = require('./server.js');

var PORT = 8012;

var dir = process.argv[2];

kickback.init(dir, function(){
	console.log(kickback.files);
	kickback.start(PORT);
});