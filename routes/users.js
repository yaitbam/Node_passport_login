var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var passport = require('passport');
var Cryptr = require('cryptr');
var LocalStrategy = require('passport-local').Strategy;
cryptr = new Cryptr('myTotalySecretKey');

// var User = require('../models/user');
var connection = require('../models/db_connect');

//Get home page

router.get('/registre', ensureAuthenticated,  function(req, res)
{
    res.render('registre');
});

router.get('/login', ensureAuthenticated,  function(req, res)
{
    res.render('login');
});

function ensureAuthenticated(req, res, next)
{
    if(req.isAuthenticated())
    {
        res.redirect('/');
    }
    else
    {
        return next();
    }
}

//Rgistre user
router.post('/registre', function(req, res)
{
    
   var name = req.body.name;
   var email = req.body.email;
   var username = req.body.username;
   var password = req.body.password;
   var password2 = req.body.password2;
//    console.log(name);

// validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password', 'password must be at least 6 characters').isLength({ min: 6 })
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);


    var errors = req.validationErrors();

    if(errors)
    {
        res.render('registre', {
            errors: errors
        });
    }
    else
    {
                connection.query("select * from users where username = ? or email = ?", [username, email],function(error,results, fields){
                if (error) {
                    req.flash('error_msg', 'There are some error with query');
                    res.redirect('/users/registre');
                  }else{
                    if(results.length > 0)
                    { 
                        req.flash('error_msg', 'Username/Email Already taken');
                        res.redirect('/users/registre');
                    }
                    else {
                    // if there is no user with that email
                    // create the user
                    var encryptedPasswd = cryptr.encrypt(password);
                    var users={
                        "name":name,
                        "username":username,
                        "email":email,
                        "password":encryptedPasswd 
                    }
                        connection.query("INSERT INTO users SET ?", users, function(error, results, fields){
                        if(error)
                        {
                            req.flash('error_msg', 'There are some error with query');
                            res.redirect('/users/registre');
                        }
                        else
                        {
                            req.flash('success_msg', 'You are registred you can now login');
                            res.redirect('/users/login');
                        }
                    });	
                }	
            }
            });
        };
});

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    connection.query("select * from users where id = "+id,function(err,rows){	
        done(err, rows[0]);
    });
});




passport.use('local-sign', new LocalStrategy(
    {
         // by default, local strategy uses username and password, we will override with email
         usernameField : 'username',
         passwordField : 'password',
         passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done)
    {
        connection.query("SELECT * FROM users WHERE username = '" + username +"'", function(err, rows)
        {
            if(err)
                return done(err);
            if(!rows.length)
            {
                return done(null, false, {message: 'Unknown User'});
            }

            //bcrypt.compareSync("B4c0/\/", hash); // true

            // if(!( rows[0].password ==  rows[0].password))
            decryptedPasswd = cryptr.decrypt(rows[0].password);
            if(password != decryptedPasswd)
                return done(null, false, {message: 'Invalid password'});

            return done(null, rows[0]);		
        });
    }));






router.post('/login', passport.authenticate('local-sign',  { successRedirect: '/', failureRedirect: '/users/login', failureFlash: true }), function(req, res) {
    res.redirect('/');
    // console.log("passport user", req.user);
});

router.get('/logout', function(req, res)
{
    req.logout();

    req.flash('success_msg', 'You are logged out');

    res.redirect('/users/login');
})

module.exports = router;