var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const randomstring = require('randomstring');
var bcrypt = require('bcrypt');
var passport = require('passport');
var Cryptr = require('cryptr');
var LocalStrategy = require('passport-local').Strategy;
cryptr = new Cryptr('myTotalySecretKey');

// var User = require('../models/user');
var connection = require('../models/db_connect');
const mailer = require('../mail/mailer');


//Get home page

router.get('/registre', ensureAuthenticated, function (req, res) {
    res.render('registre');
});

router.get('/login', ensureAuthenticated, function (req, res) {
    res.render('login');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    }
    else {
        return next();
    }
}
// router.get('/verify', function (req, res) {
//     res.render('mail');
// });


//Rgistre user
router.post('/registre', function (req, res) {
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const lowerCaseLetters = /[a-zA-Z]/g;
    const numbers = /[0-9]/g;

    const { firstname, lastname, username, email, password, password2 } = req.body;
    let errors = [];

    if (!firstname || !lastname || !username || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (!(emailRegexp.test(email))) {
        errors.push({ msg: 'Enter a valid email' });
    }

    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (!(lowerCaseLetters.test(password))) {
        errors.push({ msg: 'Password must include at least one letter!' });
    }

    if (!(numbers.test(password))) {
        errors.push({ msg: 'Password must include at least one number' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('registre', {
            errors,
            firstname,
            lastname,
            username,
            email,
            password,
            password2
        });
    }
    else {
        connection.query("select * from users where username = ? or email = ? and (verified = '1' or verified = '0')", [username, email], function (error, results, fields) {
            if (error) {
                req.flash('error_msg', 'There are some error with query');
                res.redirect('/users/registre');
            } else {
                if (results.length > 0) {
                    req.flash('error_msg', 'Username/Email Already taken');
                    res.redirect('/users/registre');
                }
                else {

                    const secretToken = randomstring.generate();
                    host = req.get('host');
                    link = "http://" + host + "/users/verify?id=" + secretToken + "&email=" + email;

                    const html = `Hi there,
                    <br/>
                    Thank you for registering!
                    <br/><br/>
                    Please verify your email by typing the following token:
                    <br/>
                    On the following page:
                    <a href="`+ link + `">Verify</a>
                    <br/><br/>
                    Have a pleasant day!`;
                    if (mailer.sendEmail('matcha1337@gmail.com', email, 'Please verify your email', html)) {
                        var hash = bcrypt.hashSync(password, 10);
                        // var encryptedPasswd = cryptr.encrypt(password);
                        var users = {
                            "firstname": firstname,
                            "lastname": lastname,
                            "username": username,
                            "email": email,
                            "password": hash,
                            "verification_code": secretToken,
                            "verified": 0
                        }
                        connection.query("INSERT INTO users SET ?", users, function (error, results, fields) {
                            if (error) {
                                errors.push({ msg: 'There are some error with query' });
                            }
                            else {
                                console.log("Message sent");
                                req.flash('success_msg', 'Please open your email inbox and click the given link so you can login');
                                res.redirect('/users/registre');
                            }
                        });
                    }
                    else {
                        req.flash('error-msg', 'Email is not sending');
                        res.redirect('/users/registre');
                    }

                }
            }
        });
    };

});


// router.get('/verify', function(req, res)
// {
//     res.render('verify');
// })
router.get('/verify', function (req, res) {
    var host = req.get('host');
        console.log(req.query.id);
        //Find the account that matches the secret token
        console.log(req.protocol+":/"+req.get('host'));
        if((req.protocol+"://"+req.get('host'))==("http://"+host))
        {
            connection.query("SELECT * FROM users where email = ? and verification_code = ?", [req.query.email, req.query.id], function (error, results, fields) {
                if (results.length > 0) {
                    connection.query('UPDATE users SET verification_code = ? , verified = 1 WHERE email = ?', ['', req.query.email]);
                    req.flash('success_msg', 'Thank you! you may login');
                    res.redirect('/users/login');
                }
                else {
                    req.flash('error_msg', "We can't find your verification code");
                    res.redirect('/users/login');
                    return;
                }
            });
        }
        else
        {
            req.flash('error_msg', "Request is from unknown source");
            res.redirect('/users/login');
        }
       
});

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
    connection.query("select * from users where id = " + id, function (err, rows) {
        done(err, rows[0]);
    });
});

passport.use('local-sign', new LocalStrategy(
    {
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function (req, username, password, done) {
        // console.log(username +"  - "  + encryptedPasswd);
        connection.query("SELECT * FROM users WHERE username = ?", [username], function (err, rows) {
            //  bcrypt.compareSync(password, hash); // true
            if (!rows.length)
                return done(null, false, { message: 'The account information or password is incorrect. Please try again' });
            if (!bcrypt.compareSync(password, rows[0].password))
                return done(null, false, { message: 'The account information or password is incorrect. Please try again' });
            if (rows[0].verified == 0)
                return done(null, false, { message: 'Your username is already in the system but not yet verified' });
            if (rows[0].verified == 1)
                return done(null, rows[0]);

        });
    }));


router.post('/login', passport.authenticate('local-sign', { successRedirect: '/', failureRedirect: '/users/login', failureFlash: true }), function (req, res) {
    res.redirect('/');
    // console.log("passport user", req.user);
});

router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
})
module.exports = router;
