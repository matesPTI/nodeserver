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
	    '<textarea name="accessToken" placeholder="Acces token..." rows="20" cols="60"></textarea>'+
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

	var token = querystring.parse(postData)['accessToken'];
	if (token == null || token == "") {
		response.write(constants.ERROR_FB_TOKEN_MISSING);
		response.end();
		return;
	}

	var options = {
		host: 'graph.facebook.com',
		port: 443,
		path: '/me?fields=id,name,birthday&access_token='+ token
	};
	https.get(options, function(res) {
		res.setEncoding('utf8');
		var info = '';
		res.on('data', function(chunk) {
			info += chunk;
		});
		res.on('end', function() {
			var JSONinfo = JSON.parse(info);

			couchrequest.exists(JSONinfo.id,
				function(err) {
					options.path = '/me/picture?redirect=0&width=320&height=320&access_token=' + token;
					https.get(options, function(imgres) {
						imgres.setEncoding('utf8');
						var imginfo = '';
						imgres.on('data', function(chunk) {
							imginfo += chunk;
						});
						imgres.on('end', function() {
							JSONinfo.picture = JSON.parse(imginfo).data.url;
							JSONinfo.distance = "20km";
							JSONinfo.yes = [];
							JSONinfo.no = [];
							JSONinfo.mates = [];
							couchrequest.put(JSONinfo.id, JSONinfo, function(couchRes) {
								response.writeHead(200, {"Content-Type": "application/json"});
								response.write(couchRes);
								response.end();
							});
						});
					})
				},
				function(couchRes) {
					response.writeHead(200, {"Content-Type": "application/json"});
					response.write(JSON.stringify(couchRes));
					response.end();
			});
		});

	}).on('error', function(e) {
		utils.write_log('Problem with request: ' + e);
	});
}

// Logs in a user and sends all his information
function user(response, postData) {
	utils.write_log('Request handler for "login" has been called');

	var id = querystring.parse(postData)['id'];
	if (id == null || id == "") {
		response.write(constants.ERROR_MATES_ID_MISSING);
		response.end();
		return;
	}
	couchrequest.exists(id, 
		function(err) {
			response.writeHead(404, {"Content-Type": "text/html"});
			response.write(err + "\n");
			response.end();
		},
		function(JSONres) {
			response.writeHead(200, {"Content-Type": "application/json"});
			response.write(JSON.stringify(JSONres));
			response.end();
	});
}


// Locates people near from the requester, based on his gps location
function locate(response, postData) {
	utils.write_log('Request handler for "locate" has been called');

	var id = querystring.parse(postData)['id'];
	var lat = querystring.parse(postData)['lat'];
	var lon = querystring.parse(postData)['lon'];

	response.writeHead(200, {"Content-Type": "text/html"});
	if (id == null || id == "") {
		response.write(constants.ERROR_MATES_ID_MISSING);
		response.end();
		return;
	}
	if (lat == null || lat == "") {
		response.write(constants.ERROR_GPS_POSITION_MISSING);
		response.end();
		return;
	}
	if (lon == null || lon == "") {
		response.write(constants.ERROR_GPS_POSITION_MISSING);
		response.end();
		return;
	}

	couchrequest.get(id, function(couchRes) {
		var JSONinfo = JSON.parse(couchRes);
		var elasticQuery = couchrequest.elasticQuery(lat, lon, JSONinfo.distance);

		couchrequest.elasticGet(elasticQuery, function(elasticRes) {
			var JSONres = JSON.parse(elasticRes);
			if (JSONres.error != null && JSONres.error != "") {
				response.writeHead(400, {"Content-Type": "text/html"});
				response.write(constants.ERROR_ELASTIC_FAILURE);
				response.end();
			}
			else {
				response.writeHead(200, {"Content-Type": "application/json"});
				response.write(JSON.stringify(JSONres.hits.hits));
				response.end();
			}
		});
	});
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

// Decide whether to mate someone or not
function mate(response, postData) {
	utils.write_log('Request handler for "mate" has been called');

	var senderid = querystring.parse(postData)['sender'];
	var receiverid = querystring.parse(postData)['receiver'];
	var mate = querystring.parse(postData)['mate'];

	if (senderid == null || senderid == "") {
		response.writeHead(400, {"Content-Type": "text/html"});
		response.write(constants.ERROR_MATES_ID_MISSING);
		response.end();
		return;
	}
	if (receiverid == null || receiverid == "") {
		response.writeHead(400, {"Content-Type": "text/html"});
		response.write(constants.ERROR_MATES_ID_MISSING);
		response.end();
		return;
	}
	if (mate == null || mate == "") {
		response.writeHead(400, {"Content-Type": "text/html"});
		response.write(constants.ERROR_MATE_VALUE_MISSING);
		response.end();
		return;
	}

	couchrequest.exists(senderid, 
		function(serr) {
			response.writeHead(400, {"Content-Type": "text/html"});
			response.write(constants.ERROR_USER_NOT_FOUND);
			response.end();
		}, 
		function(JSONme) {
			if (mate == 0) JSONme.no.push(receiverid);
			else JSONme.yes.push(receiverid);

			couchrequest.exists(receiverid,
				function(rerr) {
					response.writeHead(400, {"Content-Type": "text/html"});
					response.write(constants.ERROR_USER_NOT_FOUND);
					response.end();
				},
				function(JSONother) {
					var wishlist = JSONother.yes;
					if (wishlist.indexOf(senderid) >= 0) {
						JSONme.mates.push(receiverid);
						JSONother.mates.push(senderid);
						couchrequest.put(receiverid, JSONother, function(a){}); 

						var sender = new gcm.Sender(constants.GCM_SERVER_KEY);
						var message = new gcm.Message({
						    delayWhileIdle: true,
						    data: {
						    	type: "mate",
						        data: JSON.stringify(JSONme)
						    }
						});

						var ids = [];
						var gcmid1 = JSONme.gcmid;
						var gcmid2 = JSONother.gcmid;
						if (gcmid1 == null || gcmid1 == "") {
							response.write(constants.ERROR_UNREGISTERED_USER);
							response.end();
						}
						if (gcmid2 == null || gcmid2 == "") {
							response.write(constants.ERROR_UNREGISTERED_USER);
							response.end();
						}
						else {
							ids.push(gcmid1);
							ids.push(gcmid2);
							sender.send(message, ids, 4, function (err, result) {
							    utils.write_log('GCM error: ' + err);
							    utils.write_log('GCM result: ' + result);
							});
						}
					}
					couchrequest.put(senderid, JSONme, function(a){});

					response.writeHead(200, {"Content-Type": "text/html"});
					response.write("OK");
					response.end();
				});
	});
}

// Sends a message to a user
function send(response, postData) {
	utils.write_log('Request handler for "send" has been called');

	var sender = new gcm.Sender(constants.GCM_SERVER_KEY);
	var senderid = querystring.parse(postData)['sender'];
	var receiverid = querystring.parse(postData)['receiver'];
	var data = querystring.parse(postData)['data'];

	response.writeHead(200, {"Content-Type": "text/html"});
	if (senderid == null || senderid == "") {
		response.write(constants.ERROR_MATES_ID_MISSING);
		response.end();
		return;
	}
	if (receiverid == null || receiverid == "") {
		response.write(constants.ERROR_MATES_ID_MISSING);
		response.end();
		return;
	}
	var message = new gcm.Message({
	    delayWhileIdle: true,
	    data: {
	    	type: "message",
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

exports.init = init;
exports.signup = signup;
exports.user = user;
exports.register = register;
exports.locate = locate;
exports.mate = mate;
exports.send = send;