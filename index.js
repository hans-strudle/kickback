var kickback = require('./server.js');

var PORT = 8012;

var dir = process.argv[2];

kickback.customHeaders = {
	'css/style.css': {
		'content-type': 'text/css2'
	}
}

kickback.ignore.push('test.txt')

kickback.init(dir, function(){
	console.log(kickback.files);
	kickback.run(PORT);
});