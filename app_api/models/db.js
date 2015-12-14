var mongoose = require('mongoose');
var gracefulShutdown;
var dbURI = 'mongodb://localhost/SolarFlix';
// var dbURI = 'mongodb://root:ry8ziBonaq@proximus.modulusmongo.net:27017/togyhy6B';

/*
mongoose.connect(dbURI);

// CONNECTION EVENTS
mongoose.connection.on('connected', function() {
    console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', function(err) {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function() {
    console.log('Mongoose disconnected');
});

*/

// BRING IN YOUR SCHEMAS & MODELS
require('./dateIdeas');