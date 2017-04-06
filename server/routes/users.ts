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

    var token = request.get('authorization');

    verify(token, secret, function(tokenError) {
        if (tokenError) {
            return response.status(403).json({
                message: 'Invalid token, please Log in first'
            });
        } else {
            const salt = randomBytes(128).toString('base64');

            var hashedPw:Buffer;
            try {
                hashedPw = pbkdf2Sync(request.body.password, salt, 10000, length, digest);
            } catch (err) {
                response.status(500).json({ error: err});
            }
            //store user credentials (user,password,salt and other required info) into the database
            var reqData = {_id:"membre|"+request.body.username,
                            type:"membre",
                            username:request.body.username,
                            password:hashedPw.toString('hex'),
                            salt:salt,
                            lastname:request.body.lastname||"",
                            firstname:request.body.firstname||"",
                            address:request.body.address||"",
                            email:request.body.email||"",
                            phone:request.body.phone||"",
                            admin:request.body.admin||false
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
        }
    });

});

// User update
userRouter.put('/', function (request: Request, response: Response, next: NextFunction) {

    if (!request.body.hasOwnProperty('_rev')||!request.body.hasOwnProperty('_id')) {
        let err = new Error('No document id or revision');
        return next(err);
    }

    var token = request.get('authorization');

    verify(token, secret, function(tokenError) {
        if (tokenError) {
            return response.status(403).json({
                message: 'Invalid token, please Log in first'
            });
        } else {
            //store user credentials (user,password,salt and other required info) into the database
            var reqData = {_id:request.body._id,
                            _rev:request.body._rev,
                            type:"membre",
                            salt:request.body.salt,
                            password:request.body.password,
                            username:request.body.username,
                            lastname:request.body.lastname||"",
                            firstname:request.body.firstname||"",
                            address:request.body.address||"",
                            email:request.body.email||"",
                            phone:request.body.phone||"",
                            admin:request.body.admin
                        };
            var options = {
                host: dbHost,
                path: '/resa_tennis/'+request.body._id,
                method: 'PUT',
                rejectUnauthorized: false,
                auth: "pdestrais:id513375",
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(JSON.stringify(reqData))
                }
            };  
            console.log('/Updated User data:', JSON.stringify(reqData));

            var req = https.request(options, (res) => {
                var body = '';
                res.on('data', (d) => {
                    body += d;
                    process.stdout.write(d);
                });
                res.on('end', function() {
                        // Data reception is done, do whatever with it!
                    var parsed:any = {};
                    try {
                            parsed = JSON.parse(body);
                        } catch(e) {
                            parsed = {};
                            console.log("error parsing result");
                        }
                        if (parsed.error)
                            return response.status(500).json({
                                message: parsed.error+' - '+parsed.reason
                            });
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
        }
    });

});

// User password update
userRouter.put('/changePwd', function (request: Request, response: Response, next: NextFunction) {
    console.log("body : "+JSON.stringify(request.body));

    if (!request.body.user || !request.body.currPwd || !request.body.newPwd|| !request.body.user.hasOwnProperty('_rev') ||!request.body.user.hasOwnProperty('_id')) {
        let err = new Error('No document id or revision or password');
        return next(err);
    }

    var token = request.get('authorization');

    verify(token, secret, function(tokenError) {
        if (tokenError) {
            return response.status(403).json({
                message: 'Invalid token, please Log in first'
            });
        } else {
            // verify the Hashed currPwd corresponds to the hashed user password
            var hashedPw:Buffer;
            try {
                console.log("before Hashed pwd : "+request.body.currPwd+'-'+request.body.user.salt);
                hashedPw = pbkdf2Sync(request.body.currPwd, request.body.user.salt, 10000, length, digest);
                console.log("Hashed pwd : "+hashedPw);
            } catch (err) {
                response.status(500).json({ error: err});
            }
            console.log("Hashed pwd : "+hashedPw);
            if (hashedPw.toString('hex')!=request.body.user.password)
                return response.status(401).json({
                    message: 'Mot de passe actuel non valide'
                });
            // If currPwd is ok, then change password with new one
            else {
                const salt = randomBytes(128).toString('base64');
                try {
                    hashedPw = pbkdf2Sync(request.body.newPwd, salt, 10000, length, digest);
                } catch (err) {
                    response.status(500).json({ error: err});
                }

                //store user credentials (user,password,salt and other required info) into the database
                var reqData = {_id:request.body.user._id,
                                _rev:request.body.user._rev,
                                type:"membre",
                                salt:salt,
                                password:hashedPw.toString('hex'),
                                username:request.body.user.username,
                                lastname:request.body.user.lastname||"",
                                firstname:request.body.user.firstname||"",
                                address:request.body.user.address||"",
                                email:request.body.user.email||"",
                                phone:request.body.user.phone||"",
                                admin:request.body.user.admin
                            };
                var options = {
                    host: dbHost,
                    path: '/resa_tennis/'+request.body.user._id,
                    method: 'PUT',
                    rejectUnauthorized: false,
                    auth: "pdestrais:id513375",
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(JSON.stringify(reqData))
                    }
                };  
                console.log('/Updated User data:', JSON.stringify(reqData));

                var req = https.request(options, (res) => {
                    var body = '';
                    res.on('data', (d) => {
                        body += d;
                        process.stdout.write(d);
                    });
                    res.on('end', function() {
                            // Data reception is done, do whatever with it!
                        var parsed:any = {};
                        try {
                                parsed = JSON.parse(body);
                            } catch(e) {
                                parsed = {};
                                console.log("error parsing result");
                            }
                            if (parsed.error)
                                return response.status(500).json({
                                    message: parsed.error+' - '+parsed.reason
                                });
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
            }

        }
    });

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
