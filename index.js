var server = require('./server');
var router = require('./router');
var requestHandlers = require('./requestHandlers');

var handle = {}
handle['/'] = requestHandlers.init;
handle['/init'] = requestHandlers.init;
handle['/signup'] = requestHandlers.signup;
handle['/user'] = requestHandlers.user;
handle['/locate'] = requestHandlers.locate;
handle['/mate'] = requestHandlers.mate;
handle['/register'] = requestHandlers.register;
handle['/send'] = requestHandlers.send;
handle['/upload'] = requestHandlers.upload;

server.start(router.route, handle);