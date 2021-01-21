var redis = require('redis');

const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    logError: true
});

// var redisClient = redis.createClient({port},{host});

client.on('error', function(err) {
    console.log('Redis error: ' + err);
});

module.exports = client;