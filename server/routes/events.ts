import { Router, Response, Request } from 'express';

var https = require('https');

const eventsRouter: Router = Router();

const dbHost = 'pdestrais.cloudant.com';

//query events
eventsRouter.post('/find', (request: Request, response: Response) => {
    var reqData = JSON.stringify(request.body);
	var options = {
        host: dbHost,
        path: '/resa_tennis/_find',
        method: 'POST',
		rejectUnauthorized: false,
		auth: "pdestrais:id513375",
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(reqData)
        }
    };  
    console.log('/events find - selector:', reqData);

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
    req.write(reqData);
    req.end();
});

//create event
eventsRouter.post('/', (request: Request, response: Response) => {
    var reqData = JSON.stringify(request.body);
	var options = {
        host: dbHost,
        path: '/resa_tennis',
        method: 'POST',
		rejectUnauthorized: false,
		auth: "pdestrais:id513375",
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(reqData)
        }
    };  
    console.log('/events create data :', reqData);

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
    req.write(reqData);
    req.end();
});

//update event
eventsRouter.put('/', (request: Request, response: Response) => {
    var reqData = JSON.stringify(request.body);
	var options = {
        host: dbHost,
        path: '/resa_tennis',
        method: 'PUT',
		rejectUnauthorized: false,
		auth: "pdestrais:id513375",
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(reqData)
        }
    };  
    console.log('/events update data :', reqData);

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
    req.write(reqData);
    req.end();
});

//delete event
eventsRouter.delete('/:event_id', (request: Request, response: Response) => {
    var reqData = JSON.stringify(request.body);
	var options = {
        host: dbHost,
        path: '/resa_tennis/'+request.param("event_id")+"?_rev="+request.body._rev,
        method: 'DELETE',
		rejectUnauthorized: false,
		auth: "pdestrais:id513375",
        headers: {
            'Content-Type': 'application/json',
        }
    };  
    console.log('/events delete data :', reqData);

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
    req.end();
});

export { eventsRouter }
