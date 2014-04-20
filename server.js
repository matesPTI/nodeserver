var http = require('http');
var url = require('url');

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

	http.createServer(onRequest).listen(8888, '127.0.0.1');
	console.log('Server running at http://127.0.0.1:8888/');
}

exports.start = start;
