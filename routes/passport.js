var Cryptr = require('cryptr');
var connection = require('./../config');
cryptr = new Cryptr('myTotalySecretKey');
 
    module.exports.register=function(req,res){
    var today = new Date();
    var encryptedString = cryptr.encrypt(req.body.password);
    console.log("encryptedString");
    var users={
        "name":req.body.name,
        "email":req.body.email,
        "password":encryptedString,
        "created_at":today,
        "updated_at":today
    }
    var name = req.body.name;
    var email = req.body.email;

      connection.query('SELECT * FROM users WHERE name = ? or email = ?',[name, email], function (error, results, fields) {
      if (error) {
        res.setHeader("Content-Type", "text/html");
        res.write("<p>there are some error with query</p>");
         
      }else{
        if(results.length > 0)
        { 
          res.setHeader("Content-Type", "text/html");
          res.write("<p>Username/Email Already taken</p>");
        }
        else
        {
            connection.query('INSERT INTO users SET ?',users, function (error, results, fields) {
            if (error) {
              res.setHeader("Content-Type", "text/html");
              res.write("<p>there are some error with query</p>");
            }else{
              res.setHeader("Content-Type", "text/html");
              res.write("<p>user registered sucessfully</p><a href='../'>Login</a>");
            }
          });
        }
      }
    });
 
}
