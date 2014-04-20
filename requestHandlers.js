var exec = require("child_process").exec;
var querystring = require('querystring');

function init(response, postData) {
	console.log('Request handler for "init" has been called.');

	var body = '<html>'+
	    '<head>'+
	    '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'+
	    '</head>'+
	    '<body>'+
	    '<form action="/upload" method="post">'+
	    '<textarea name="text" rows="20" cols="60"></textarea>'+
	    '<input type="submit" value="Submit text" />'+
	    '</form>'+
	    '</body>'+
	    '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

function upload(response, postData) {
	console.log('Request handler for "upload" has been called.');

	response.writeHead(200, {"Content-Type": "text/html"});
  	response.write("POST data recieved: " + querystring.parse(postData)['text']);
  	response.end();
}

exports.init = init;
exports.upload = upload;