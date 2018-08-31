// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE.txt in the project root for license information.
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var User = require('./models/user');
var bcrypt = require('bcrypt');

require('dotenv').config();

var index = require('./routes/index');
var authorize = require('./routes/authorize');
var mail = require('./routes/mail');
var calendar = require('./routes/calendar');
var contacts = require('./routes/contacts');
var video = require('./routes/video');
var screenShare = require('./routes/screen-share');
var meeting = require('./routes/meeting');
var invite = require('./routes/invite');
// -------- sunrise --------- //
var join = require('./routes/join');
var host = require('./routes/host');
var signin = require('./routes/signin');
var signup = require('./routes/signup');
var meetingRoom = require('./routes/meetingRoom');
// ---------- end ----------- //
var auth = require('./routes/auth');

var app = express();
// Set public folder as root
app.use(express.static(path.join(__dirname, '/public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view options', { layout : 'layout/main' });
app.set('view engine', 'hbs');
// app.get('/stylesheets/style.css', function(req, res){ res.send('stylesheets/style.css'); res.end(); });
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 1000 * 60 * 30
    }
}));

app.use('/', index);
app.use('/authorize', authorize);
app.use('/mail', mail);
app.use('/calendar', calendar);
app.use('/contacts', contacts);
app.use('/video', video);
app.use('/screen-share', screenShare);
app.use('/meeting', meeting);
app.use('/invite', invite);
// ------- sunrise -------- //
app.use('/auth', auth);
app.use('/join', join);
app.use('/host', host);
app.use('/meetingRoom', meetingRoom);
// --------- end ----------//

// Provide access to node_modules folder
app.use('/scripts', express.static(`${__dirname}/node_modules/`));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
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



