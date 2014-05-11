function route(handle, pathname, response, dataPost) {

	if (typeof handle[pathname] == 'function') {
		handle[pathname](response, dataPost);
	} else {
		write_log("Couldn't find a handler for " + pathname);
		response.writeHead(404, {"Content-Type": "text/html"});
    	response.write("404 Not found");
    	response.end();
	}
}

function write_log(info) {
	fs.appendFile("log.txt", new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') 
									+ ' : ' + info + '\n', function(err) {});
}

exports.route = route;