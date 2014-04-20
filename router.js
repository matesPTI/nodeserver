function route(handle, pathname, response, dataPost) {
	console.log('Routing a request for ' + pathname);

	if (typeof handle[pathname] == 'function') {
		handle[pathname](response, dataPost);
	} else {
		console.log("Couldn't find a handler for " + pathname);
		response.writeHead(404, {"Content-Type": "text/html"});
    	response.write("404 Not found");
    	response.end();
	}
}

exports.route = route;