/*
 * http route handling module
 */

var http = require('http')

// django api and its request handler 
// application = webapp.WSGIApplication([
//     ('/api/site/info.json', SiteInfoHandler),
//     ('/api/nodes/all.json', NodesAllHandler),
//
// class SiteInfoHandler(webapp.RequestHandler)
//	def get(self):

// invoking init just set-up event listener, or bind event.
// other type of init returns a closure{}
//
exports.init = function(ss) {
	api = require('api').init(ss);

	// connect app == ss.http.middleware
	ss.http.middleware.prepend(ss.http.connect.bodyParser())

    // if there is no listener, http router will drop post request.
	ss.http.router.on('/', function(req, res) {
        console.log('app-route-/, request on root');
		res.serveClient('main');
	});

	// serve the static http assets first, to show web page, and ws request follows.
	ss.http.router.on('/solana', function(req, res) {
		console.log('app-router-on-/solana req method:', req.method);
		res.serveClient('solana');
	});

	// for http req, webapp.RequestHandler, /api/show.json?q=xx.
	// ss.rpc mod.api will thru WS req.
	ss.http.router.on('/solana/post', function(req, res){
		data = req.body;
		console.log('app-router-on-solana/post post data::', data);
		for ( k in data ){
			console.log('k=',k,' val=',data[k])
		}

		api.processFix(data.lat, data.lng, function(err){
			console.log('lat/lng at:', err);
		});

		res.serveClient('api');
	});
    
	// serve the static http assets first, to show web page, and ws request follows.
	ss.http.router.on('/todos', function(req, res) {
		console.log('app-router-on-/todos req method:', req.method);
		res.serveClient('todos');
	});

	// serve the static http assets first, to show web page, and ws request follows.
	ss.http.router.on('/contacts', function(req, res) {
		console.log('app-router-on-/contacts req method:', req.method);
		res.serveClient('contacts');
	});
};
