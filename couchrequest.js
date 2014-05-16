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

function exists(id, onFalse, onTrue) {
	get(id, function(couchRes) {
		JSONinfo = JSON.parse(couchRes);
		if (JSONinfo.error == null || JSONinfo.error == "") {
			onTrue(JSONinfo);
		}
		else {
			onFalse(JSONinfo.error);
		}
	});
}

/**
 * lat, lon format: 0.0
 * dist format: "20km"
 */
function elasticQuery(lat, lon, dist) {
	var JSONobject = {
		"query": {
			"filtered" : {
		    	"query" : {
		        	"match_all" : {}
		    	},
		    	"filter" : {
		        	"geo_distance" : {
		            	"distance" : dist,
		            	"location" : {
		                	"lat" : lat,
		                	"lon" : lon
		            	}
		        	}
		    	}
			}
		}
	};
	return JSONobject;
}

function elasticGet(query, callback) {
	var options = {
		host: constants.ELASTIC_SERVER_IP,
		port: constants.ELASTIC_SERVER_PORT,
		path: constants.ELASTIC_SERVER_PATH,
		method: 'POST'
	};
	var elasticReq = http.request(options, function(res) {
		res.setEncoding('utf8');
		var elasticRes = '';
		res.on('data', function(chunk) {
			elasticRes += chunk;
		});
		res.on('end', function() {
			callback(elasticRes);
		});

	}).on('error', function(e) {
		utils.write_log('Problem with request: ' + e);
	});

	elasticReq.write(JSON.stringify(query));
	elasticReq.end();
}

exports.get = get;
exports.put = put;
exports.exists = exists;
exports.elasticQuery = elasticQuery;
exports.elasticGet = elasticGet;