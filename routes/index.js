var express = require('express');
var router = express.Router();

//Get home page

router.get('/', ensureAuthenticated,  function(req, res)
{
    res.render('index', { username: req.user.username, email:  req.user.email });
    console.log(req.user.username);
});


function ensureAuthenticated(req, res, next)
{
    if(req.isAuthenticated())
    {
        return next();
    }
    else
    {
        // req.flash('error_msg', 'You are not logged in');
        res.redirect('/users/login');
    }
}

module.exports = router;