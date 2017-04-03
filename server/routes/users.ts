import { Router, Request, Response, NextFunction } from 'express';
import { randomBytes, pbkdf2Sync } from 'crypto';
import { sign,verify } from 'jsonwebtoken';
import { secret, length, digest } from '../config';

var https = require('https');

const dbHost = 'pdestrais.cloudant.com';

const userRouter: Router = Router();

// get user by id
userRouter.get("/:user_id", (request: Request, response: Response, next: NextFunction) => {
    
    //first verify jwt token
    var token = request.get('authorization');

    verify(token, secret, function(tokenError) {
        if (tokenError) {
            return response.status(403).json({
                message: 'Invalid token, please Log in first'
            });
        }

        next();
    });

    // if token is ok, continue
    var options = {
        host: dbHost,
        path: '/resa_tennis/'+request.param("user_id"),
        method: 'GET',
		rejectUnauthorized: false,
		auth: "pdestrais:id513375",
        headers: {
            'Content-Type': 'application/json'
        }
    };  
    console.log('/fectching userid :', request.param("user_id"));

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
    req.end();

});

// User create
userRouter.post('/', function (request: Request, response: Response, next: NextFunction) {
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
	var reqData = {_id:"member|"+request.body.username,
                    type:"membre",
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
        path: '/resa_tennis',
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
        var body = '';
        res.on('data', (d) => {
            body += d;
            process.stdout.write(d);
        });
        res.on('end', function() {
                // Data reception is done, do whatever with it!
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
userRouter.post('/login', function (request: Request, response: Response, next: NextFunction) {
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
    console.log('/login selector :', JSON.stringify(selector));

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
                        hash = pbkdf2Sync(request.body.password, parsed.docs[0].salt, 10000, length, digest);
                    } catch (e) {
                        response.json({error:"error when calculating password hash : "+JSON.stringify(e)});
                    }
                    // check if password is correct by recalculating hash on paswword and comparing with stored value
                        if (hash.toString('hex') === parsed.docs[0].password) {
                            const token = sign({'user': parsed.docs[0].username, permissions: []}, secret, { expiresIn: '7d' });
                            parsed.docs[0].token = token;
                            response.json(parsed.docs[0]);
                        } else {
                            console.log('wrong password');
                            response.json({message: 'Wrong password'});
                        }
                } catch(e) {
                    parsed = {};
                    console.log("error parsing result :"+JSON.stringify(e));
                }
        });
    });

    req.on('error', (e) => {
        console.error("Node Server Request got error: " + e.message);
    });
    req.write(JSON.stringify(selector));
    req.end();

});

export { userRouter };
