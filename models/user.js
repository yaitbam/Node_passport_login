// var mongoose = require('mongoose');
// var bcrypt = require('bcryptjs');
// var connection = require('./db_connect');
// //User schema
// var UserShema = mongoose.Schema({
//     username: {
//         type: String,
//         index: true,
//     },
//     password: {
//         type: String
//     },
//     email: {
//         type: String
//     },
//     name: {
//         type: String
//     }
// });


// //TO access outside of this file
// var User = module.exports = mongoose.model('User', UserShema);

// module.exports.createUser = function(newUser, callback){

//     bcrypt.genSalt(10, function(err, salt) {
//         bcrypt.hash(newUser.password, salt, function(err, hash) {
//             // Store hash in your password DB.
//             // var newUser = new Object();
//             name = newUser.name ;
//             email = newUser.email; 
//             username = newUser.username;
//             newUser.password = hash;
//             password = newUser.password;
//             var insertQuery = "INSERT INTO users(name, username, email, password) VALUES (?, ?, ?)";
//                  console.log(insertQuery);
//             connection.query(insertQuery, [name, username, email, password], function(err, rows)
//             {
                
//                     // newUser.id = rows.id;
//                       newUser.save(callback);
//             });
//             // newUser.save(callback);
//         });
//     });
// }

// module.exports.getUserbyUsername  =  function(username, callback)
// {
//     var query = {username: username};
//     User.findOne(query, callback);
// }

// module.exports.getUserById  =  function(id, callback)
// {
//     User.findById(id, callback);
// }

// module.exports.comparePassword = function(condidatePassword, hash, callback)
// {
//     bcrypt.compare(condidatePassword, hash, function(err, isMatch) {
//         if(err) throw err;
//         callback(null, isMatch);
//     });
// }