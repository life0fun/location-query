/*
 * deprecated db connection instance. use ss.api.add('db', db)
 */
var mongo = require('mongodb')

// dep inject global settings to cache opened db instance.
module.exports = function(AppGlobals) {
     console.log('open mongo connection...');
     var srv = new mongo.Server('localhost', 27017);
     var client = new mongo.Db('location', srv);
     client.open(function(err, db){ 
        console.log('mongo db opened, ', err);
        AppGlobals.M = db
     });
};
