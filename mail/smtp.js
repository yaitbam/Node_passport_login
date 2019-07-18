var nodemailer = require('nodemailer');

var smtp = nodemailer.createTransport(
    {
        service: 'Gmail',
        auth: {
            user: 'matcha1337@gmail.com',
            pass: '2019y2019'
        }
    });
module.exports = smtp;