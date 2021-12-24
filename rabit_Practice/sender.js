var amqp = require('amqplib/callback_api');
const csv = require('csv-parser')
const fs = require('fs')


const results = [];

amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }

        var queue = 'hello';
       // var msg = 'Hello World!';

        fs.createReadStream('data.csv')
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                //console.log(results);
        
            
            console.log(results)

        channel.assertQueue(queue, {
            durable: false
        });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(results)));

        console.log(" [x] Sent %s", results);
    });
    setTimeout(function () {
        connection.close();
        process.exit(0);
    }, 500);
});
});