// SET UP ======================================================================

// Import foreign goods
var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon'); //Not needed
var logger = require('morgan'); //Note logger = morgan~!
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var util = require('util');
var assert = require('assert');

// IBM Bluemix
var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();

//Application specific tools
//var mongoose = require('mongoose'); //We use MySQL, not Mongoose
var passport = require('passport'); //Passport for authentication
var session = require('express-session');
var flash = require('connect-flash');
var mysql = require('mysql'); //Database api

var morgan = require('morgan');
//Import local goods
var configDB = require('./config/database.js');
//var users = require('./routes/users'); //We don't need tHIS anymore.

var app = express(); //Sets up the express application
//var port = /* process.env.PORT || */8081;

var index = require('./routes/routes');//(app, passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// CONFIGURATION ===============================================================
var dbConfig = require('./config/database');

// OLD DATABASE SETUP
//var connection = mysql.createConnection(dbConfig);

require('./config/passport')(passport); // pass passport for configuration

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev')); //log every request to the CONSOLE.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', index);
//app.use(app.router);
//index.initialize(app);

//Required for passport...
app.use(session( {secret: 'thenamesovbyeahyouknowmeimtheironchancellorofgermanyyeahyoubetterbringthegameifyousteptomecauseimthemasterofforeignpolicywhat',
                  resave: true,
                  saveUninitialized: true} ));
// ^ session secret (why do I do this to myself...) is just to add random-ness to the password encryption
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// DATABASE SETUP ==============================================================

var connectionPool = mysql.createPool(dbConfig);
connectionPool.getConnection(function(err, connection) {
  if (err) throw err;
  //Nothing goes here yet
});


// // THIS IS THE OLD DATABASE SETUP
// connection.connect(function(err) {
//   console.log("Performing first time setup. ");
//   if (err) {
//     console.log(err);
//   }
//   else {
//
//     console.log("Everything seems to be in order.")
//
//     /* I DONT BELIEVE WE NEED TO CREATE TABLES NOW SO IL JUST COMMENT THIS OUT */
//
//     //
//     // CREATE MAIN USER AUTHENTICATION TABLE -----------------------------------
//
//     //var queryDatabase = "CREATE SCHEMA IF NOT EXISTS fn DEFAULT CHARACTER SET utf8 ; USE fn ;"
//     //var queryTable = "CREATE TABLE IF NOT EXISTS fn.users (ID INT(11) AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255), password VARCHAR(256));"
//     //normal schema
//
//     //
//     /*
//     queryDatabase = "";
//     queryTable = "CREATE TABLE IF NOT EXISTS ibmx_7c3d0b86c1998ef.auth (ID INT(11) AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255), password VARCHAR(256), report BOOLEAN);"
//     connection.query(queryDatabase + queryTable, function (error, data) {
//       console.log("Query'd!");
//       if (error) {
//         if (error.code == 'ER_TABLE_EXISTS_ERROR') {
//           console.log("The table already exists");
//         }
//         console.log(error);
//       }
//       else {
//         console.log("Table created.");
//         //index(app, passport); //Do dis after this been called! A S Y N C H R O N O U S
//       }
//     });
//     */
//
//     // CREATE TABLE(S) FOR USER REPORT -----------------------------------------
//   }
//
// });


// ROUTES ======================================================================
index(app, passport); //Load our routes and pass in our app in full

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

// LAUNCH ======================================================================
//app.listen(port);
//console.log('The magic happens on port ' + port);
// start server on the specified port and binding host

/*
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
*/
