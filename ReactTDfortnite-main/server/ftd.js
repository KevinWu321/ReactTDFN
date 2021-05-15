// https://www.freecodecamp.org/news/express-explained-with-examples-installation-routing-middleware-and-more/
// https://medium.com/@viral_shah/express-middlewares-demystified-f0c2c37ea6a1
// https://www.sohamkamani.com/blog/2018/05/30/understanding-how-expressjs-works/

var port = 8000; 
var webSocketPort = port+1;
var express = require('express');
var Stage = require('./static_content/model.js')
var app = express();
var id = 5;

//Game Setup
var stage = new Stage.Stage();
var objects = stage.actors;
var interval=setInterval(function(){
	stage.step();
	wss.broadcast();	
	objects = stage.actors;
   }, 40);

const { Pool } = require('pg')
const pool = new Pool({
    user: 'webdbuser',
    host: 'localhost',
    database: 'webdb',
    password: 'password',
    port: 5432
});

var WebSocketServer = require('ws').Server
   ,wss = new WebSocketServer({port: webSocketPort});

   wss.on('close', function() {
    console.log('disconnected');
});

wss.broadcast = function(message){
	for(let ws of this.clients){ 
		var msg = {};
		var localObject = [];
		if (!stage.players.hasOwnProperty(ws.id)){
			msg.type = "dead";
		} else {
			for (var j = 0; j < objects.length; j++){
				if ((ws.player.position.distanceTo(objects[j].position)) < 900){
					localObject.push(objects[j])
				}
			}
			msg.objects = localObject;
		}
		msg.player = ws.player;
		ws.send(JSON.stringify(msg)); 
	}
}

const bodyParser = require('body-parser'); // we used this middleware to parse POST bodies
function isObject(o){ return typeof o === 'object' && o !== null; }
function isNaturalNumber(value) { return /^\d+$/.test(value); }
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(bodyParser.raw()); // support raw bodies

// Non authenticated route. Can visit this without credentials
app.post('/api/test', function (req, res) {
	res.status(200); 
	res.json({"message":"got here"}); 
});

/** 
 * This is middleware to restrict access to subroutes of /api/auth/ 
 * To get past this middleware, all requests should be sent with appropriate
 * credentials. Now this is not secure, but this is a first step.
 *
 * Authorization: Basic YXJub2xkOnNwaWRlcm1hbg==
 * Authorization: Basic " + btoa("arnold:spiderman"); in javascript
**/
app.use('/api/auth', function (req, res,next) {
	if (!req.headers.authorization) {
		return res.status(403).json({ error: 'No credentials sent!' });
  	}
	try {
		// var credentialsString = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
		var m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		var user_pass = Buffer.from(m[1], 'base64').toString()
		m = /^(.*):(.*)$/.exec(user_pass); // probably should do better than this

		var username = m[1];
		var password = m[2];

		console.log(username+" "+password);

		let sql = 'SELECT * FROM ftduser WHERE username=$1 and password=sha512($2)';
        	pool.query(sql, [username, password], (err, pgRes) => {
  			if (err){
                		res.status(403).json({ error: 'Not authorized'});
			} else if(pgRes.rowCount == 1){
				next(); 
			} else {
                		res.status(403).json({ error: 'Invalid Login Credentials'});
        		}
		});
	} catch(err) {
               	res.status(403).json({ error: 'Not authorized'});
	}
});


app.use('/api/reg', function (req, res,next) {
	if (!req.headers.authorization) {
		return res.status(403).json({ error: 'No credentials sent!' });
  	}
	try {
		// var credentialsString = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
		var m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		var user_pass = Buffer.from(m[1], 'base64').toString()
		m = /^(.*):(.*)$/.exec(user_pass); // probably should do better than this

		var username = m[1];
		var password = m[2];

		console.log(username+" "+password);

		let sql = 'SELECT * FROM ftduser WHERE username=$1';
        	pool.query(sql, [username], (err, pgRes) => {
  			if (err){
                		res.status(403).json({ error: 'Error'});
			} else if(pgRes.rowCount >= 1){
						res.status(403).json({ error: 'Username Taken'});
			} else {
						let query = 'INSERT INTO ftduser (username, password) VALUES($1, sha512($2))';
							pool.query(query, [username, password], (err1, pgRes) => {
								if (err1){
									res.status(403).json({ error: 'Registration Error'});
								}
							});
							
                		next(); 
        		}
		});
	} catch(err) {
               	res.status(403).json({ error: 'Registration Error'});
	}
});

app.post('/api/reg/register', function (req, res) {
	res.status(200); 
	res.json({"message":"registration success"}); 
});

app.post('/api/auth/change', function (req, res) {
    if(!"username" in req.body){
        res.status(400);
        res.json({"Error": "The body is missing required input"});
        return;
    }
    if(!"oldPassword" in req.body){
        res.status(400);
        res.json({"Error": "The body is missing required input"});
        return;
    }
    if(!"newPassword" in req.body){
        res.status(400);
        res.json({"Error": "The body is missing required input"});
        return;
    }
    


    let sql = 'UPDATE ftduser SET password = sha512($1) WHERE username=$2 and password=sha512($3)';
    pool.query(sql, [req.body.newPassword, req.body.username, req.body.oldPassword], (err, pgRes) => {
        if (err){
            res.status(403);
            res.json({"Error": err}); 
        } else if(pgRes.rowCount == 0){
                        res.status(401).json({ error: 'Incorrect Password'});
        } else {
            res.status(200);
            res.json({"message": "Password has been updated"}); 
            }
        });
});


app.post('/api/auth/update', function (req, res) {
	if(!"score" in req.headers){
		res.status(400);
		res.json({"Error": "The body is missing required input"});
		return;
	}
	if(!"username" in req.headers){
		res.status(400);
		res.json({"Error": "The body is missing required input"});
		return;
	}
	let sql = 'UPDATE ftduser SET score = $1 WHERE score < $1 AND username=$2';
	pool.query(sql, [req.headers.score, req.headers.username], (err, pgRes) => {
		if (err){
			res.status(403);
			res.json({"Error": err}); 
		} else {
			res.status(200);
			res.json({"message": "Scores have been updated"}); 
			}
		});
});

app.get('/api/auth/leaderBoard', function (req, res) {
	let sql = 'select username, score from ftduser ORDER BY score DESC limit 10';
	pool.query(sql, [], (err, pgRes) => {
		if (err){
			res.status(403);
			res.json({"Error": err}); 
		} else {
			res.status(200);
			res.json(pgRes.rows)
			}
		});
});

// All routes below /api/auth require credentials 
app.post('/api/auth/login', function (req, res) {
	res.status(200); 
	res.json({"message":"authentication success"}); 
});

app.post('/api/auth/test', function (req, res) {
	res.status(200); 
	res.json({"message":"got to /api/auth/test"}); 
});

app.use('/',express.static('static_content')); 

wss.on('connection', function(ws) {
	console.log("connected")
	ws.id = id;
	ws.isAlive = true;
	id += 1;
	ws.player = stage.generatePlayer(ws.id);
	stage.addPlayer(ws.player);
	ws.send(JSON.stringify({type: "id", "id": id}));
	ws.on('message', function(message) {
		var body = JSON.parse(message);
		var type = body.type;
		if (type == "reload"){
			ws.player.reload();
		} else if (type == "move"){
			ws.player.setVelocity(new Stage.Pair(body.velocity.x, body.velocity.y));
		} else if(type == "shoot"){
			ws.player.shoot(new Stage.Pair(body.velocity.x, body.velocity.y));
		} else if(type == "point"){
			ws.player.weapon.aim(new Stage.Pair(body.velocity.x, body.velocity.y));
		}
		else if (type == "quit"){
			stage.removeActor(ws.player.weapon);
			stage.removePlayer(ws.player);
		}

	});
	ws.on('pong', function(){
		ws.isAlive = true;
	});

	ws.on("close", function(){
		stage.removeActor(ws.player.weapon);
		stage.removePlayer(ws.player)
	});

});


app.listen(port, function () {
  	console.log('Example app listening on port '+port);
});
