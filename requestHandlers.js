var exec = require("child_process").exec;
var querystring = require('querystring');
var http = require('http');
var https = require('https');
var futures = require('futures');
var gcm = require('node-gcm');
var couchrequest = require('./couchrequest');
var utils = require('./utils');
var constants = require('./constants');

function init(response, postData) {
	utils.write_log('Request handler for "init" has been called.');

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
	utils.write_log('Request handler for "signup" has been called');

	var token = querystring.parse(postData)['accesToken'];
	var options = {
		host: 'graph.facebook.com',
		port: 443,
		path: '/me?fields=id,name,birthday&access_token='+ token
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
			var JSONinfo = JSON.parse(info);
			couchrequest.put(JSONinfo.id, JSONinfo, function(couchRes) {
				response.writeHead(200, {"Content-Type": "application/json"});
				response.write(couchRes);
				response.end();
			});
		});
}

// Logs in a user and sends all his information
function login(response, postData) {
	utils.write_log('Request handler for "login" has been called');

	response.writeHead(200, {"Content-Type": "text/html"});
	response.write("login");
	response.end();
}

// Locates people near from the requester, based on his gps location
function locate(response, postData) {
	utils.write_log('Request handler for "locate" has been called');

	var id = querystring.parse(postData)['id'];
	if (id == null || id == "") {
		response.write(constants.ERROR_MATES_ID_MISSING);
		response.end();
	}
	else {
		couchrequest.get(id, function(couchRes) {
			response.writeHead(200, {"Content-Type": "application/json"});
			response.write(info);
			response.end();
		});
	}
}

function register(response, postData) {
	utils.write_log('Request handler for "register" has been called');

	var matesid = querystring.parse(postData)['matesid'];
	var gcmid = querystring.parse(postData)['gcmid'];

	response.writeHead(200, {"Content-Type": "text/html"});
	if (matesid == null || matesid == "") {
		response.write(constants.ERROR_MATES_ID_MISSING);
		response.end();
	}
	else if (gcmid == null || gcmid == "") {
		response.write(constants.ERROR_GCM_ID_MISSING);
		response.end();
	}
	else {
		couchrequest.get(matesid, function(couchGetRes) {
			JSONinfo = JSON.parse(couchGetRes);
			JSONinfo.gcmid = gcmid;

			couchrequest.put(matesid, JSONinfo, function(coughPutRes) {
				response.writeHead(200, {"Content-Type": "application/json"});
				response.write(coughPutRes);
				response.end();
			});
		});
	}
}

// Sends a message to a user
function send(response, postData) {
	utils.write_log('Request handler for "send" has been called');

	var sender = new gcm.Sender('AIzaSyCRYkW6OoS8NrURzI-MsU3SkrsfDhPrmRs');
	var senderid = querystring.parse(postData)['sender'];
	var receiverid = querystring.parse(postData)['receiver'];
	var data = querystring.parse(postData)['data'];

	response.writeHead(200, {"Content-Type": "text/html"});
	if (senderid == null || senderid == "") {
		response.write(constants.ERROR_MATES_ID_MISSING);
		response.end();
	}
	if (receiverid == null || receiverid == "") {
		response.write(constants.ERROR_MATES_ID_MISSING);
		response.end();
	}
	else {

		var message = new gcm.Message({
		    /*collapseKey: 'demo',*/
		    delayWhileIdle: true,
		    data: {
		        data: data
		    }
		});

		var ids = [];
		couchrequest.get(receiverid, function(couchRes) {
			var gcmid = JSON.parse(couchRes).gcmid;
			if (gcmid == null || gcmid == "") {
				response.write(constants.ERROR_UNREGISTERED_USER);
				response.end();
			}
			else {
				response.write("OK");
				response.end();
				ids.push(gcmid);

				/**
				 * Params: message-literal, registrationIds-array, No. of retries, callback-function
				 **/
				sender.send(message, ids, 4, function (err, result) {
				    utils.write_log('GCM error: ' + err);
				    utils.write_log('GCM result: ' + result);
				});
			}
		});
		}
}

exports.init = init;
exports.signup = signup;
exports.login = login;
exports.register = register;
exports.locate = locate;
exports.send = send;