var https = require('https');
var url = require('url');
var fs = require('fs');

function start(route, handle) {

	function onRequest(request, response) {
		var pathname = url.parse(request.url).pathname;
		var dataPost = "";
		write_log('Request on ' + pathname + ' recieved.');

		request.setEncoding("utf8");

        request.addListener("data", function(chunk) {
          	dataPost += chunk;
          	write_log("POST chunk recieved: '" + chunk + "'.");
        });

        request.addListener("end", function() {
	     	route(handle, pathname, response, dataPost);
	    });
	}

	var pk = fs.readFileSync('./ssl/ec2key.pem');
	var pc = fs.readFileSync('./ssl/ec2cert.pem');
	var opts = {
		key: pk,
		cert: pc
	};
	https.createServer(opts, onRequest).listen(443);
	write_log('Server running at https://localhost:443/');
}

function write_log(info) {
	fs.appendFile("log.txt", new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') 
									+ ' : ' + info + '\n', function(err) {});
}

exports.start = start;
