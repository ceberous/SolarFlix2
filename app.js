var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

require('./app_api/models/db');

// var routes = require('./app_server/routes/index');
var routesAPI = require('./app_api/routes/index');
// var users = require('./app_server/routes/users');

var app = express();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client')));

// heroku http bull shit
if ( app.get('env') === 'production' ) {
    app.use( '*' , function( err , req , res , next ){
        
        if ( req.headers['x-forwarded-proto'] != 'https' ) {
            return res.redirect( [ 'https://' , req.get('Host') , req.url ].join('') );
        }
        else {
            next();
        }

    });
}

app.all('/' , function(req , res , next){
    res.sendFile('index.html' , {root: __dirname });
});
app.use('/api' , routesAPI);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    req.connection.setTimeout( 50000 );
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        /*
        res.render('error', {
            message: err.message,
            error: err
        });
        */
        res.send({message: err.message})
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});




module.exports = app;
