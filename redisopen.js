var redis = require("redis"),
    client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

client.set("hello", "Node.js");

client.get("hello", function(err, val) {
        console.log(val);
        client.quit();
});