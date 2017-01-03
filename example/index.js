var kickback = require('kickback');

kickback.basedir = __dirname + '/site';
kickback.map[404] = '/404.html';
kickback.mapper = function(url, res, cb){
	if (url.endsWith('/')){
		url += 'index.html';
	}
	return url;
}
kickback.endpoints['/info'] = function(url, req, cb){
	console.log(cb);
	cb(4);
}
kickback.start(80);
console.log(kickback);
