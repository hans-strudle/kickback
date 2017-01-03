var http = require('http'),
	URL = require('url'),
    fs = require('fs'),
    qs = require('querystring');

var kickback = {
    basedir: '.',
	quiet: false,
    map: {
        '/': '/index.html'
    },
    endpoints: {},
	log: function(...data){
		if (!kickback.quiet) console.log('kickback: ', data.join(' '));
	},
    serve: function(path, cb){
		kickback.log('grabbing file:',kickback.basedir + path);
		fs.readFile(kickback.basedir + path, function(err, content){
			if (err) kickback.log(err);
			cb(content);
		})
    },
	mapper: function(url,req){
		if (url.length > 1 && url.endsWith('/')) url = url.substr(0,url.length-1);
		return kickback.map[url];
	},
	headers: function(url, content, cb){
		var head = {code: 404, headers: {}};
		if (content){
			head.code = 200;
		}
		if (url.endsWith('.css')){
			head.headers['Content-Type'] = 'text/css';
		} else if (url.endsWith('.js')){
			head.headers['Content-Type'] = 'text/js';
		}
		return head;
	},
	every: function(url, query, req, cb){
		// this will run everytime a request is made
		kickback.log('request path:', url);
		kickback.log('request query:', JSON.stringify(query));
	},
	onStatus: function(code, cb){
			return kickback.serve('/' + code + '.html') || ('Error! status code: ' + code);
	},
    onRequest: function(req, res){
		var url  = URL.parse(req.url);
		var query = qs.parse(url.query);
		kickback.every(url.pathname, query, req);
		var url = kickback.mapper(url.pathname, req) || url.pathname;
		// if no endpoint, just try and serve the file
		var result = kickback.endpoints[url] || kickback.serve(url, function(result){
			if (!result) result = '404';
			var header = kickback.headers(url, result, function(header){
				kickback.sendRes(res, header, result); // serve & header sync
			});
			kickback.sendRes(res, header, result);
		});
		// endpoint can be static or a function
		if (typeof result == 'function') result = result(url, query, req, function(result){
			var header = kickback.headers(url, result, function(header){
				kickback.sendRes(res, header, result); // endpoint & header async	
			});
			kickback.sendRes(res, header, result); // endpoint async, header sync
		});
		var header = kickback.headers(url, result, function(header){
			kickback.sendRes(res, header, result); // result sync & header async
		});
		kickback.sendRes(res, header, result); //both sync
    },
	sendRes: function(res, header, result){
		if (header && result){ // still waiting
			res.writeHead(header.code, header.headers);
			res.end(result || '');
			return true;
		}
		return false;
	},
    start: function(port, cb){
        kickback.server = http.createServer(kickback.onRequest);
		kickback.server.listen(port, function(){
			port = port || 80;
			kickback.log('Listening on port:', port);
			if (cb) cb(kickback);
			return kickback;
		});
    } 
};

module.exports = kickback;

if (!module.parent){
	if (process.argv.indexOf('--quiet') > 0) kickback.quiet = true;
	kickback.basedir = process.argv[2] || '.';
	kickback.start(process.argv[3] || 80);
}
