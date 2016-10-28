var kickback = require('../server.js'),
	path = require('path');

var qs = require('querystring');

var PORT = 8012;

var dir = 'test-site';

var total = 0;

kickback.customHeaders = {
	'css/style.css': {
		'content-type': 'text/css'
	}
}

kickback.endpoints = {
	'index.html': function(url, query){
		total += parseInt(qs.parse(query).amount);
		console.log('Total: ', total);
	},
	'edit.html': function(url, query, req){
		var newFile = qs.parse(query).file
		kickback.files['edit.html'] = '<html><head><title>edit</title><body>' +
		'<textarea>' + kickback.files[newFile] + '</textarea>' +
		'</body></html>'
	}
}

kickback.ignore.push('test.txt')

kickback.init(dir, function(){
	console.log(kickback.files);
	kickback.run(PORT);
});