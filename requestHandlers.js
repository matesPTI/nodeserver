var exec = require("child_process").exec;
var querystring = require('querystring');
var https = require('https');
var futures = require('futures');
var gcm = require('node-gcm');
var fs = require('fs');

function init(response, postData) {
	write_log('Request handler for "init" has been called.');

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
	write_log('Request handler for "signup" has been called');

	var token = querystring.parse(postData)['accesToken'];
	var options = {
		host: 'graph.facebook.com',
		port: 443,
		path: '/me?fields=picture&access_token='+ token
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
	write_log('Request handler for "login" has been called');

	response.writeHead(200, {"Content-Type": "text/html"});
	response.write("login");
	response.end();
}

// Locates people near from the requester, based on his gps location
function locate(response, postData) {
	write_log('Request handler for "locate" has been called');

	response.writeHead(200, {"Content-Type": "text/html"});
	response.write("locate");
	response.end();
}

// Sends a message to a user
function send(response, postData) {
	write_log('Request handler for "send" has been called');

	var sender = new gcm.Sender('AIzaSyBVanMtwZZd3-cgqYwPwt9JAfUhWqxmoYE');
	var id = querystring.parse(postData)['id'];
	var data = querystring.parse(postData)['data'];

	response.writeHead(200, {"Content-Type": "text/html"});
	if (id == null) {
		response.write("ERROR: ID MISSING");
		response.end();
	}
	else {
		response.write("OK");
		response.end();

		var message = new gcm.Message({
		    /*collapseKey: 'demo',*/
		    delayWhileIdle: true,
		    data: {
		        data: data
		    }
		});
		var ids = [];
		ids.push(id);
		/**
		 * Params: message-literal, registrationIds-array, No. of retries, callback-function
		 **/
		sender.send(message, ids, 4, function (err, result) {
		    write_log('GCM error: ' + err);
		});
		}
}

function write_log(info) {
	fs.appendFile("log.txt", new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') 
									+ ' : ' + info + '\n', function(err) {});
}

exports.init = init;
exports.signup = signup;
exports.login = login;
exports.locate = locate;
exports.send = send;