var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var Cryptr = require('cryptr');

cryptr = new Cryptr('@$@$R@%GFQFQ42');
var app = express();

/* 
    Nous configurons ici les détails de notre serveur SMTP. 
    STMP est un serveur de messagerie qui est responsable de l'envoi et de la réception des emails. 
*/ 

var smtp = nodemailer.createTransport(
    {
        service: 'Gmail',
        auth: {
            user: 'matcha1337@gmail.com',
            pass: '2019y2019'
        }
    });

    var rand, mailOption, host,link;

    app.get('/', function(req, res)
    {
        res.sendfile('index.html');
    });

    app.get('/send', function(req, res)
    {
        rand = Math.floor((Math.random() * 100) + 54);
        rand = cryptr.encrypt(rand);
        host = req.get('host');

        link="http://"+req.get('host')+"/verify?id="+rand;
        mailOption = {
            to : req.query.to,
            subject : "Please confirm your Email account",
            html : "Hello,<br> Please Click on the link to verify your email.<br>"+
            "<a href="+link+">Click here to verify</a>" 
        }
        console.log(mailOption);
        smtp.sendMail(mailOption, function(error, res)
        {
            if(error)
            {
                console.log(error);
                res.end("Error");
            }
            else
            {
                console.log("Message sent: " + res.message);
                res.end("Sent");
            }
        });
    });

    app.get('/verify', function(req,res)
    {
        console.log(req.protocol+":/"+req.get('host'));
        if((req.protocol+"://"+req.get('host')) == ("http://" + host))
        {
            console.log("Domain is matched Information is from Authentic email");
            if(req.query.id == rand)
            {
                console.log("Email is verified");
                res.end("<h1>Email "+mailOption.to+" is been Successfully verified");
            }
            else
            {
                console.log("email is not verified");
                res.end("<h1>Bad Request</h1>");
            }
        } 
        else
        {
            res.end("<h1>Request is from unknown source");
        }
    });


    app.listen(3000, function()
    {
        console.log("Express started at port 3000");
    })