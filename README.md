## template is just a fragment view, with model data formatted to view through ArrayAdapter.getView

  * put your template file under client/templates/place.jade
  * app.js adds template folder ss.client.define( tmpl: ['.'])
  * refresh the page, you see html contains script tag of the template.
  * use HT['places'] to refer template content.

	` places = $.ajax({type:"GET", url:"http://api.xx.", data:({}), success: show})
      places = $.getJSON(url, function(data){ $(data).each(function(index, value){}); controller.pushObject(o)});
	  function show(data) {
        $('#places').append HT['places'].render(data)
	  }
	`

## Everything is objects wrap objects in hierachy. 
* file is a module, exports.init() is factory method. objref = require('file').init(root, ss, config);
* Given require returns exports object and init also returns object, why bother to do init ?
* the answer is that factory can take init arguments, dependency injections, config options. Bam!
* responders = require('./request/index')(api, client) ==== init factory pattern

* API is a server closure module that impls IF functions. dep inject req handle to server object. 
* Dep injects rpc request handler to responder IF object; Outside calls IF object function, route to req handler.
    server: require('./interface').init(root, prefix, mw, ss)

* new design: request-index just create responders. Each responder is a closure with IF and req handler.
* each responder is closure module that Impl interfaces function with websocket function.

exports.init = function(root,ss,config){  // pass init arguments, inject dependency to factory method.
    return 
        load: (mw) ->
            request = require('./handler').init(root, prefix, mw, ss);
            return
                server: require('./interface').init(request, prefix), <- dep inject of request handle to IF
                client: { return coffee.compile(input)

* request module load responders and expose _responder.interfaces(middlewareStack)_ with middleware stack.
exports = (ss, client) ->
    responders = {}
    middlewareStack = require('./middleware')(ss).load()
    add: (mod) -> 
    load: ->
        for name, responder of responders
            output[name] = {name: responder.name, interfaces: responder.interfaces(middlewareStack)}
    output

* responder is a closure module impls server interface API. websocket func handle socket msg by responder req handler.
exports = (responderId, config, ss) ->
    ss.client.send(xxx)
    interfaces : (middleware) ->
        request = require('./request')(ss, middleware) <-- middleware passed to req handler.
        websocket: (content, meta, send) ->
            request req, (err, response) ->

## SocketStream Arch === wiring socket.io msg to responders websock IF handler

* request-responder-rpc-handler defines all rpc api end points. request(req,res) -> apiTree, stack[i].call(req, res-cb, i+1)
* request-responder-rpc-interface defines responder API IFs. e.g. websocket(msg,meta,socket) -> request(req, res)
* http req is handled by connect() module. map http req to websocket event, bind event handle to request handler(responder).
    emitter.on(name, repsonder.server.websocket) -> request(req, res) 
* request-responder-rpc-index: init rpc handler and pass to server=require('interface')
* request-responder-index: require('responders').init(root,ss)
* request-responder-responders: api to add/load responders into responders[] and init middlewares.
* request-index: return require('responders').init(root,ss)

* websocket-index: bind websocket event <--> responders IF func using emitter.on(responder.name, responder.server.websocket)
* websocket-transport: use socketio, load httpServer, emitter to socketio transport.
* websocket-transport-socketio-index: socket.on('message', (msg) -> emitter.emit(type, content, meta, (data)->)
* websocket-transport-socketio-wrapper: io.connect(), and bind conn events. conn.on('disconnect', xx)
* websocket object encapsulate underly transport layer, either socket.io or event emitter.

* http-index: return{ connect, middleware, router, load }
* http-router: route(url, req, res) -> emit(url,req, res), on(url, cb) -> emit.on(url, cb)

* request object encapsulate request handling into responders.
* websocket object binds socket event to request responders.
* socket.io emit rpc event upon socket message, the callback of event emit send resp data thru socket.
* rpc responder handle socket msg event in IF websocket func. emitter.on(rpc-event, request.responder.websocket)
* rpc responder closure exposes request handler. All files under rpc form a apiTree.
* request handle has a method chain stack with middleware on top and method actions on bottom.
* request.responder.rpc.load loads responder, server IF closure has rpc request handler and websocket event handler.
* top level websocket bind rpc event to responder server IF websocket event handler.

## how websocket msg got handled by various responders. 

* when getting a socket.io msg, just emit it with msg prefix as msg type.
* each responder IDed by its type, which is socket.io msg prefix
* bind eventEmitter's msg type to responder's server IF's websocket method, which run msg handler. 

1. At top level, a socketstream server contains rpc req responders and sessionStore.
   Each responder = { name: 'rpc', interfaces: msgHander }  // mainly rpc responder
   rpc responder to websocket IF to module.action

    var server = {
        responders: request.responders.load(),  // all req responders[msgPrefix] objects
        eventTransport: publish.transport.load(),
        sessionStore: session.store.get()
    }

2. Inside each responder object, responder's load() return {server IF} which contains {raw:xx, websocket:xx}
    load: (middleware) ->
        request = require('./handler').init(root, msgPrefix, mw, ss)
        server: require('./interface').init(request, msgPrefix)
        client: xxx
                                        
3. In web stack, bind req responders to websocket event.
    var ws = require('./websocket/index').init(root, request, api)
    if ( httpServer){
        var wsTransport = ws.load(httpServer, server.responders, server.eventTransport);
    }

4. Inside websocket-index, load function binds event(string) to responder's msg handler
   Each responder = { name: 'rpc', interfaces: msgHander }  // mainly rpc responder
   rpc responder to websocket IF to module.action
    msgPrefix type to responder's websocket function.

    load: (httpServer, responders, eventTransport) ->
        for name, responder of responders
            emitter.on( name, responder.server.websocket )  # responder server IF websocket function

5. inside websocket-transports-socketio-index, handle msg just by emitting the msg.
    io = socketio.listen(httpServer)
    io.sockets.on 'connection', (socket) ->
        socket.on 'message', (msg) ->
            [type, content] = utils.parseWsMessage(msg)
            meta = {socketId: socket.id, ( httpServer){
            var wsTransport = ws.load(httpServer, server.responders, server.eventTransport);
    }

#
## socketstream Asset management
#

* define Endpoint ss.client.define('solana', {view:[], code:[]}) handle by client/index.js define. 
* asset.js load html(solana.html), css, js(libs/1.jquer, 2.ember.js, solana/app.coffee)
* process.env['SS_PACK'] is false, set by export SS_PACK=true
* client-index-load, require('./pack').pack() 
* client-pack: constructor : solana/ss03/client/static/assets solana/ss03/client/static/assets/solana
* packAssetSet([css, js, html])
* Pre-packing and minifying the 'solana' client...client.name: solana, client.id=134xxx 
* ✓ Packed 3 files into /client/static/assets/solana/1342989575789.css
* ✓ Packed 5 files into /client/static/assets/solana/1342989575789.js

## Http Request Vs. WebSocket request

* ss contains node http.Server and websocket rpc responder. 

    var wsTransport = ws.load(httpServer, server.responders, server.eventTransport);
	socketio.listen(httpServer)

* In websocket top object, bind websocket event, mainly rpc, to rpc responder's websocket IF function. 
    socketio.on('message', (msg)-> emitter.emit('rpc', content, meta, (data) -> socket.send(data);
    emitter.on('rpc', responder.server.websocket); // { server: { raw: [Function], websocket: [Function], internal: [Function] },

* In socketio.on('message', (msg)-> emitter.emit('rpc', content, meta, (data) -> socket.send(data);
* Http request, not handled by websocket event rpc responder.
* Connect HTTP middleware used to serve static client/static/asset request. add http post api handle also.
* http router parse url and emit(url, req, res) and emitter.on(url, cb)
* App.js needs to push bodyParser middleware in order to get request body. cookieParser and session default.
    ss.http.middleware.prepend(ss.http.connect.bodyParser())

* after bodyParser middleware, req.body contains post body. Route post req to proper handle in Router. 
    eventMiddleware = (req,res,next) -> http.router.route(req.url, req, res) return next()

* ss.http.router.on('/solana/post', function(req, res){
    api = require('api').init(ss);
    data = req.body;
    api.processFix(data.lat, data.lng, (err)->);


## use ember mvc js lib in the client.
* define ss.client.define('ember', { view:'ember.html', css:['libs', 'todos.css'], code:['libs', 'ember'], tmpl:[] });
* ss.client.templateEngine.use('ember'); or use('ember', '/ember') to limit ember only to '/ember' directory.
* ss.http.router.on('/ember', function(req, res) { res.serveClient('ember');}
* in client/view/ember.html, define views with x-handlebar script.
    1. ul list, controller is array, render it with ul.
        {{ #collection tagName="ul" contentBinding="Todos.todosController" itemClassBinding="content.isDone"}}
            {{view Em.Checkbox titleBinding="content.title" valueBinding="content.isDone"}}
        {{/collection}}
                           
    2. div with text field
       {{ view Todos.CreateTodoView id="new-todo" placeholder="What needs to be done?"}}

       Todos.CreateTodoView = Em.TextField.extend({
        insertNewLine: function() {
          Todos.todosController.createTodo(this.get('value');
        }
       });

* in client/code/libs, ensure lib loading order: 1.jquery, 2.ember.min.js, 3. dropdown
* in client/code/ember/entry.js, load the app.js that create ember app and controller in as early as possible in 
  $(document).ready(function() { require('/app');}

* handle UI events with same name method or define action method or {{action}} helper. 
  No need to register listener to bind event. Just impl a method with the same name as event you want handle.

    Em.View.extend({ click: function(evt){ } })

    {{view Em.Button classBinding="isActive" target="Todos.todosController" action="clearCompletedTodos"}}
    Todos.todosController = Em.ArrayProxy.create({
        clearCompletedTodos: function() { 
            this.filterProperty('isDone', true).forEach(this.removeObject, this);
        }

        allAreDone: function(key, value) {
            if (value !== undefined) {
                this.setEach('isDone', value);
                return value;
            } else {
                return !!this.get('length') && this.everyProperty('isDone', true);
            }
        }.property('@each.isDone')  <-- function as property, computed properties
    }

    {{view Em.Checkbox title="Mark All as Done" valueBinding="Todos.todosController.allAreDone"}}

* #Block form of view {{#view }}{{/view}}. Parent view begin with #view {{#view}} close with {{/view}}. Child view {{view ...}}. 

* Attribute as Property so that View can refer property thru {{name-variable}}

* Flow control with helper {{#if}} or bind context with {{#with}}

* Ember.ArrayController is array and manage a list of models. it has content property to store data set.

