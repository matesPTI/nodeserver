var http = require('http');
var utils = require('./utils');
var constants = require('./constants');

function get(path, callback) {
	var options = {
		host: constants.COUCH_SERVER_IP,
		port: constants.COUCH_SERVER_PORT,
		path: constants.COUCH_USERS_PATH + path,
	};

	http.get(options, function(res) {
		res.setEncoding('utf8');
		var couchRes = '';
		res.on('data', function(chunk) {
			couchRes += chunk;
		});
		res.on('end', function() {
			callback(couchRes);
		});

	}).on('error', function(e) {
		utils.write_log('Problem with request: ' + e);
	});
}

function put(path, JSONdata, callback) {
	var options = {
		host: constants.COUCH_SERVER_IP,
		port: constants.COUCH_SERVER_PORT,
		path: constants.COUCH_USERS_PATH + path,
		method: 'PUT'
	};

	var couchReq = http.request(options, function(res) {
		res.setEncoding('utf8');
		var couchRes = '';
		res.on('data', function(chunk) {
			couchRes += chunk;
		});
		res.on('end', function() {
			callback(couchRes);
		});

	}).on('error', function(e) {
		utils.write_log('Problem with request: ' + e);
	});

	couchReq.write(JSON.stringify(JSONdata));
	couchReq.end();
}

exports.get = get;
exports.put = put;