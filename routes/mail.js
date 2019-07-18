var router = require('/users');

router.get('/verify', function (req, res) {

    connection.query("SELECT * FROM users WEHRE email = ? and verification_code = ? and verified = 0", [req.query.email, req.query.id], function (err, rows) {
        if (err) {
            errors.push({ msg: 'There are some error with query' });
        }
        else if (rows.length) {
            connection.query("UPDATE users SET verified = 1 WHERE email = ?", [req.query.email], function (error, results, fields) {
                if (error) {
                    errors.push({ msg: 'There are some error with query' });
                }
                else {
                    console.log("Email is verified");
                    req.flash('success_msg', 'Your email is valid, thanks!. You may now login');
                    res.redirect('/users/login');
                }
            });
        }
        else {
            console.log("Email is not verified");
            errors.push({ msg: "We can't find your verification code" });
        }
    });
});
module.exports = 