var fs = require('fs');

function write_log(info) {
	fs.appendFile("log.txt", new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') 
									+ ' : ' + info + '\n', function(err) {});
}

exports.write_log = write_log;