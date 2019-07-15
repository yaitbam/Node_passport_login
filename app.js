var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require("express-session");
var passport = require('passport');
var mongose = require('mongoose');

// mongose.connect('mongodb://localhost/Passport',  { useNewUrlParser: true,useCreateIndex: true, });
// var db = mongose.connection;

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

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Express session 
app.use(session({
    secret: 'sectrf$$$@$',
    saveUninitialized: true,
    resave: true
}));

//Passport init
app.use(passport.initialize()); //est un middle-ware qui initialise Passport .
/*
Les middlewares sont des fonctions qui ont accès à l'objet de requête (req),
 à l'objet de réponse (res) et à la fonction middleware suivante 
 dans le cycle de requête-réponse de l'application.*/
app.use(passport.session());


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
    res.locals.users = req.user || null;
    // res.locals.name = req.user.name;
    // console.log(req.user);

    next();
    
});



app.use('/', routes);
app.use('/users', users);

//Set port
app.set('port', (process.env.PORT || 1337));

app.listen(app.get('port'), function()
{
    console.log('Server started on port ' + app.get('port'));
});
