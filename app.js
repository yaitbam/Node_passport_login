var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// var exphbs = require('express-ejs-layouts');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require("express-session");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongose = require('mongoose');

mongose.connect('mongodb://localhost/Passport', { useNewUrlParser: true });
var db = mongose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');


//Init app
var app = express();

//View engine 
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

//bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());


//set statci folder
app.use(express.static(path.join(__dirname, 'public')));

//Passport init
app.use(passport.initialize());
app.use(passport.session());

//Express session 
app.use(session({
    secret: 'sectrf$$$@$',
    saveUninitialized: true,
    resave: true
}));

//Express validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value)
    {
        var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

        while(namespace.length)
        {
            formParam += '[' + namespace.shift() + ']';
        }
        return{
            param : formParam,
            msg: msg,
            value: value
        };
    }
}));

//Connect flash
app.use(flash());

//Global vars
app.use(function(req, res, next)
{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg  = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.use('/', routes);
app.use('/users', users);

//Set port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function()
{
    console.log('Server started on port ' + app.get('port'));
});
