// My SocketStream app

var http = require('http')
  , ss = require('socketstream');

// Define a single-page client end-point.
// load by src/client/index.js
ss.client.define('main', {
  view: 'app.html',
  css:  ['libs', 'app.styl'],
  code: ['libs/1.jquery.min.js', 'app'],
  tmpl: ['chat']
});

ss.client.define('solana', {
  view:   'solana.html',
  css:    ['libs', 'solana.styl'],
  code:   ['libs', 'solana'],
  tmpl:   '*'
});

ss.client.define('api', {
  view:   'app.html',
  css:    ['libs', 'app.styl'],
  code:   ['libs', 'main'],
  tmpl:   ['*']
});

ss.client.define('todos', {
  view:   'todos.html',
  css:    ['libs', 'todos.css'],
  code:   ['libs', 'todos'],
  tmpl:   []
});

ss.client.define('contacts', {
  view:   'contacts.html',
  css:    ['libs', 'contacts.css'],
  code:   ['libs', 'contacts'],
  tmpl:   []
});

// Serve this client on the root URL
//ss.http.route('/', function(req, res){
//  res.serveClient('main');
//})


// Code Formatters
ss.client.formatters.add(require('ss-stylus'));
ss.client.formatters.add(require('ss-coffee'));
ss.client.formatters.add(require('ss-jade'));

// Use server-side compiled Hogan (Mustache) templates. Others engines available
ss.client.templateEngine.use(require('ss-hogan'));
// use the default template engine, ember, for files under templates/todos
//ss.client.templateEngine.use('ember', '/todos');
ss.client.templateEngine.use('ember');

// Minimize and pack assets if you type: SS_ENV=production node app.js
if (ss.env == 'production') ss.client.packAssets();

// config/set-up/initialize route event handler. 
// just pass in ss, router is property of ss.http.router
router = require('./route').init(ss);
// init db object, add to ss.api.add('db', db), ref by ss.db later.
require('./db')(ss);

// Start web server
var server = http.Server(ss.http.middleware);
server.listen(3000);

// Start SocketStream
ss.start(server);
