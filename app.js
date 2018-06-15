var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

const session = require('express-session');
const mysqlStore = require('express-mysql-session')(session);
const fs = require('fs');
//const { URL } = require('url');

const index = require('./routes/index');
const login = require('./routes/login');
const logout = require('./routes/logout');
const users = require('./routes/users');

var app = express();

// Locals params
app.locals.appParams = JSON.parse(fs.readFileSync(path.join(__dirname, '', 'usc-params.json'), 'utf8'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Session control
var mysqlStoreOptions = {
  host     : app.locals.appParams.db_host,
  port     : app.locals.appParams.db_port,
  user     : app.locals.appParams.db_user,
  password : app.locals.appParams.db_password,
  database : app.locals.appParams.db_database
};

var sessionStore = new mysqlStore(mysqlStoreOptions);

//var cookieOptions = { path: '/', httpOnly: true, secure: false, maxAge: null }
var sessionOptions = {
    //key: , ???
    //name: , ??? - default name: "connect.sid"
    secret: app.locals.appParams.session_secret,
    store: sessionStore,
    resave: app.locals.appParams.session_resave,
    saveUninitialized: app.locals.appParams.session_save_uninitialized,
    cookie: app.locals.appParams.session_cookie
}

//process.env['NODE_ENV'] = 'production';
//console.log(process.env);
//console.log(process.env.NODE_ENV);
//console.log(app.get('env'));
if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // trust first proxy
    sessionOptions.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionOptions));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/login', login);
app.use('/logout', logout);
app.use('/users', users);

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
