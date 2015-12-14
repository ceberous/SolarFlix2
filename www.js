#!/usr/bin/env node
var debug = require('debug')('Express4');
var app = require('./app');
var port = process.env.PORT || 3000;

app.set('port', port );

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});
