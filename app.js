var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
const passport = require('passport');
const mongoose = require('mongoose'); 
const dotenv = require('dotenv');
const utils = require('./lib/utils');

dotenv.config({path: `.env.${process.env.NODE_ENV}`});

require('./passport/').setupStrategies(passport);

mongoose.connect(utils.getDBURL()).then(
(db) => console.log("Connected correctly to Database."), 
(err) => console.log(err));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users/');
var notesRouter = require('./routes/notes/');

var app = express();
console.log("Running on", app.get('env'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());
app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/notes', notesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next({
    status: 404,
    clientMsg: "Page not found\nWhere were you going?",
  });
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  if(!(req.app.get('env') === 'test')) console.error(req.url, err.message);
  
  // User feedback
  res.status(err.status || 500);
  res.json({ msg: err.clientMsg? err.clientMsg : "Something Got Wrong!" });
});

module.exports = app;
