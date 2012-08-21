/*
 * api handle of http post data
 */

var http = require('http')

//
// API handle
// django api and its request handler 
//
// application = webapp.WSGIApplication([
//     ('/api/site/info.json', SiteInfoHandler),
//     ('/api/nodes/all.json', NodesAllHandler),
//
// class SiteInfoHandler(webapp.RequestHandler)
//	def get(self):
//  def post(self, data):
//

exports.init = function(ss) {

	return {
		processFix: function(lat, lng, cb){
			console.log('api-processFix:', lat, lng);
			cb('sillicon vally');
		},
		getLocation: function(addr, cb) {
            console.log('api-getLocation:', addr);
		}
	}
};
