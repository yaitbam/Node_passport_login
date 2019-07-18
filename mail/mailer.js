const nodemailer = require('nodemailer');

const  transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'matcha1337@gmail.com',
        pass: '2019y2019'
    }
});

module.exports = {
    sendEmail(from, to, subject, html) {
        return new Promise((resolve, reject) => {
            transport.sendMail({ from, subject, to, html}, (err, info) => {
                if(err) reject(err);
                resolve(info);
            });
        });
    }
}
// app.get('/verify',function(req,res){
//     console.log(req.protocol+":/"+req.get('host'));
//     if((req.protocol+"://"+req.get('host'))==("http://"+host))
//     {
//         console.log("Domain is matched. Information is from Authentic email");
//         if(req.query.id==rand)
//         {
//             console.log("email is verified");
//             res.end("<h1>Email "+mailOptions.to+" is been Successfully verified");
//         }
//         else
//         {
//             console.log("email is not verified");
//             res.end("<h1>Bad Request</h1>");
//         }
//     }
//     else
//     {
//         res.end("<h1>Request is from unknown source");
//     }
//     });