
const MongoClient = require("mongodb").MongoClient;
var amqp = require('amqplib/callback_api');

MongoClient.connect("mongodb://localhost:27017/DB_DEMO", { useNewUrlParser: true },async (error, client) => {

    if(error) throw error;

    database = client.db('DB_DEMO');
    collection = database.collection("client");

amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }else{
        console.log('connection');
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        var queue = 'hello';

        channel.assertQueue(queue, {
            durable: false
        });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(queue, function(results) {
            try{
                const result_data = JSON.parse(results.content)
                collection.insertMany(result_data, (err, result) => {
                    if (err) throw console.log(err);
                });
            }catch(e){
                console.log("Insert Error ::" +e)
            }
            //console.log(JSON.parse(results.content));
        }, {
            noAck: true
        });
        
    });
});
});