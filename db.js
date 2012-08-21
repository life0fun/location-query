/*
 * Mongo db connection object
 */
var mongo = require('mongodb')

module.exports = function(ss) {
     console.log('open mongo connection...');
     var srv = new mongo.Server('localhost', 27017);
     var client = new mongo.Db('location', srv);
     client.open(function(err, db){ 
        console.log('mongo db opened, err=', err);
        // add your db object to the internal API and ref with ss.db
        ss.api.add('db', db);  
        console.log('ss.env :', ss.env);
     });
};
