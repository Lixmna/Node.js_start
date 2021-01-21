var redis = require('redis');
var redisClient = redis.createClient({port},{host});

redisClient.auth({password}, function (err) {
    if (err) throw err;
});

redisClient.on('error', function(err) {
    console.log('Redis error: ' + err);
});

module.exports = redisClient;