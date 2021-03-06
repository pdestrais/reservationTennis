import { Router, Request, Response, NextFunction } from 'express';
import { randomBytes, pbkdf2Sync } from 'crypto';
import { sign } from 'jsonwebtoken';
import { secret, length, digest } from '../config';

var https = require('https');

const loginRouter: Router = Router();
const dbHost = 'pdestrais.cloudant.com';

const user = {
    hashedPassword: '6fb3a68cb5fe34d0c2c9fc3807c8fa9bc0e7dd10023065ea4233d40a2d6bb4a' +
    '7e336a82f48bcb5a7cc95b8a590cf03a4a07615a226d09a89420a342584a' +
    'a28748336aa0feb7ac3a12200d13641c8f8e26398cfdaf268dd68746982bcf' +
    '59415670655edf4e9ac30f6310bd2248cb9bc185db8059fe979294dd3611fdf28c2b731',
    salt: 'OxDZYpi9BBJUZTTaC/yuuF3Y634YZ90KjpNa+Km4qGgZXGI6vhSWW0T91' +
    'rharcQWIjG2uPZEPXiKGnSAQ73s352aom56AIYpYCfk7uNsd+7AzaQ6dxTnd9AzCCdIc/J' +
    '62JohpHPJ5eGHUJJy3PAgHYcfVzvBHnIQlTJCQdQAonQ=',
    username: 'john'
};

loginRouter.post('/register', function (request: Request, response: Response, next: NextFunction) {
    if (!request.body.hasOwnProperty('password')) {
        let err = new Error('No password');
        return next(err);
    }

    const salt = randomBytes(128).toString('base64');

    var hashedPw:Buffer;
    try {
        hashedPw = pbkdf2Sync(request.body.password, salt, 10000, length, digest);
    } catch (err) {
        response.status(500).json({ error: err});
    }
    //store user credentials (user,password,salt and other required info) into the database
	var reqData = {type:"membre",
                    username:request.body.username,
                    password:hashedPw.toString('hex'),
                    salt:salt,
                    lastname:request.body.lastname||"",
                    firstname:request.body.firstname||"",
                    address:request.body.addres||"",
                    email:request.body.email||"",
                    phone:request.body.phone||"",
                    admin:false
                };
    var options = {
        host: dbHost,
        path: '/resa_tennis/_find',
        method: 'POST',
		rejectUnauthorized: false,
		auth: "pdestrais:id513375",
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(reqData))
        }
    };  
    console.log('/registration data:', JSON.stringify(reqData));

    var req = https.request(options, (res) => {
        //console.log('statusCode:', res.statusCode);
        //console.log('headers:', res.headers);
        var body = '';
        res.on('data', (d) => {
            body += d;
            process.stdout.write(d);
        });
        res.on('end', function() {
                // Data reception is done, do whatever with it!
                //console.log("before parsing - body : "+body);
               var parsed = {};
               try {
                    parsed = JSON.parse(body);
                } catch(e) {
                    parsed = {};
                    console.log("error parsing result");
                }
                response.json({
                    doc: parsed
                });
        });
    });

    req.on('error', (e) => {
        console.error("Node Server Request got error: " + e.message);
    });
    req.write(JSON.stringify(reqData));
    req.end();

});

// login method
loginRouter.post('/', function (request: Request, response: Response, next: NextFunction) {

    // get user credentials from the database
    var selector = {
                "selector": {
                    "$and": [
                    {
                        "type": "membre"
                    },
                    {
                        "username": request.body.username
                    }
                    ]
                },
                "sort": ["lastname"]
            };

    var options = {
        host: dbHost,
        path: '/resa_tennis/_find',
        method: 'POST',
		rejectUnauthorized: false,
		auth: "pdestrais:id513375",
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(selector))
        }
    };  
    console.log('/login selctor :', JSON.stringify(selector));

    var req = https.request(options, (res) => {
        //console.log('statusCode:', res.statusCode);
        //console.log('headers:', res.headers);
        var body = '';
        res.on('data', (d) => {
            body += d;
            process.stdout.write(d);
        });
        res.on('end', function() {
                // Data reception is done, do whatever with it!
                //console.log("before parsing - body : "+body);
               var parsed:any = {};
               try {
                    parsed = JSON.parse(body);
                    // verify that the password stored in the database corresponds to the given password
                    var hash:Buffer;
                    try {
                        hash = pbkdf2Sync(request.body.password, parsed.doc.salt, 10000, length, digest);
                    } catch (e) {
                        response.json({error:e});
                    }
                    // check if password is correct by recalculating hash on paswword and comparing with stored value
                        if (hash.toString('hex') === parsed.doc.hashedPassword) {
                            const token = sign({'user': parsed.doc.username, permissions: []}, secret, { expiresIn: '7d' });
                            response.json({'jwt': token});

                        } else {
                            response.json({message: 'Wrong password'});
                        }
                } catch(e) {
                    parsed = {};
                    console.log("error parsing result");
                }
                response.json({
                    doc: parsed
                });
        });
    });

    req.on('error', (e) => {
        console.error("Node Server Request got error: " + e.message);
    });
    req.write(JSON.stringify(selector));
    req.end();

});

export { loginRouter }
