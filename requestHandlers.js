var exec = require("child_process").exec;
var querystring = require('querystring');
var https = require('https');
var futures = require('futures');

function init(response, postData) {
	console.log('Request handler for "init" has been called.');

	var body = '<html>'+
	    '<head>'+
	    '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'+
	    '</head>'+
	    '<body>'+
	    '<form action="/signup" method="post">'+
	    '<textarea name="accesToken" placeholder="Acces token..." rows="20" cols="60"></textarea>'+
	    '<input type="submit" value="Submit token" />'+
	    '</form>'+
	    '</body>'+
	    '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

// Signs up a user given his Facebook token
function signup(response, postData) {
	console.log('Request handler for "signup" has been called');

	var token = querystring.parse(postData)['accesToken'];
	var options = {
		host: 'graph.facebook.com',
		port: 443,
		path: '/me?access_token='+ token
	};
	var sequence = futures.sequence();

	sequence
		.then(function(next) {
			https.get(options, function(res) {
				res.setEncoding('utf8');
				var info = '';
				res.on('data', function(chunk) {
					info += chunk;
				});
				res.on('end', function() {
					next(info);
				});

			}).on('error', function(e) {
				console.error('Problem with request: ' + e);
			});
		})
		.then(function(next, info) {
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write(info);
			response.end();
		});
}

// Logs in a user and sends all his information
function login(response, postData) {
	console.log('Request handler for "login" has been called');

	response.writeHead(200, {"Content-Type": "text/html"});
	response.write("login");
	response.end();
}

// Locates people near from the requester, based on his gps location
function locate(response, postData) {
	console.log('Request handler for "locate" has been called');

	response.writeHead(200, {"Content-Type": "text/html"});
	response.write("locate");
	response.end();
}

exports.init = init;
exports.signup = signup;
exports.login = login;
exports.locate = locate;