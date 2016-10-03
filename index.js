var http = require('http');

var server = require('./server.js');
server.port = 7777;
server.init(process.argv[2]);