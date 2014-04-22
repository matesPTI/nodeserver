var server = require('./server');
var router = require('./router');
var requestHandlers = require('./requestHandlers');

var handle = {}
handle['/'] = requestHandlers.init;
handle['/init'] = requestHandlers.init;
handle['/signup'] = requestHandlers.signup;
handle['/login'] = requestHandlers.login;
handle['/locate'] = requestHandlers.locate;
handle['/upload'] = requestHandlers.upload;

server.start(router.route, handle);