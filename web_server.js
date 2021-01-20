var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require("fs")

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var server = app.listen(3002,function () {
    console.log("Express server has started on port 3002")
})

app.use (cors());
app.use('/api', api);

app.use (express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(session({
    secret: '@#@$MYSIGN#@$#$',
    resave: false,
    saveUninitialized: true
}));


var router = require('./router/main')(app, fs);