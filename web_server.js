var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var session = require('express-session');
var connectRedis = require('connect-redis');
var RedisStore = connectRedis(session);
var sessionSecret = '@#@$MYSIGN#@$#$';

const redis = require('redis');
/*
var sess = {
    resave : false,
    saveUninitialized: false,
    secret: sessionSecret,
    name: 'sessionId',
    cookie: {
        httpOnly: true,
        secure: false,
    },
    store: new RedisStore({url: 'http://192.168.0.38:6379', logErrors: true}),
};*/

const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    logError: true
});

const sessionOption = { resave: false,
     saveUninitialized: false,
      secret: process.env.COOKIE_SECRET,
       cookie: { httpOnly: true, secure: false },
        store: new RedisStore({ client }) 
};


var fs = require("fs")
/*
var redis = require('redis');
var client = redis.createClient();      
*/
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var server = app.listen(3002,function () {
    console.log("Express server has started on port 3002")
})

app.use (cors());
// app.use('/api', api);

app.use (express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

/*
app.use(session({
    secret: '@#@$MYSIGN#@$#$',
    resave: false,
    saveUninitialized: true
}));
*/

app.use(session({sessionOption}));

client.on('error', function (err) {
    console.log('Error ' + err);
});

var router = require('./router/main')(app, fs);