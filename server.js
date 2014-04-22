var https = require('https');
var url = require('url');
var fs = require('fs');

function start(route, handle) {

	function onRequest(request, response) {
		var pathname = url.parse(request.url).pathname;
		var dataPost = "";
		console.log('Request on ' + pathname + ' recieved.');

		request.setEncoding("utf8");

        request.addListener("data", function(chunk) {
          	dataPost += chunk;
          	console.log("POST chunk recieved: '" + chunk + "'.");
        });

        request.addListener("end", function() {
	     	route(handle, pathname, response, dataPost);
	    });
	}

	var pk = fs.readFileSync('./ssl/privatekey.pem');
	var pc = fs.readFileSync('./ssl/certificate.pem');
	var opts = {
		key: pk,
		cert: pc
	};
	https.createServer(opts, onRequest).listen(443, '127.0.0.1');
	console.log('Server running at https://127.0.0.1:443/');
}

exports.start = start;
