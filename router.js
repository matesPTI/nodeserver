var utils = require('./utils');

function route(handle, pathname, response, dataPost) {

	if (typeof handle[pathname] == 'function') {
		handle[pathname](response, dataPost);
	} else {
		utils.write_log("Couldn't find a handler for " + pathname);
		response.writeHead(404, {"Content-Type": "text/html"});
    	response.write("404 Not found");
    	response.end();
	}
}

exports.route = route;