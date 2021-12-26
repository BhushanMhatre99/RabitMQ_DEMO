const express = require('express');
const app = express()
const path = require('path');
const bodyparser = require("body-parser");
const session = require('express-session');
const User = require('./models/users');
const fetch_data = require('./models/fetch_data');
const ejs = require('ejs');

var amqp = require('amqplib/callback_api');
const csv = require('csv-parser')
const fs = require('fs')



app.set('view-engine', 'ejs');


const mongoose = require('mongoose');
app.use(bodyparser.urlencoded({ extended: true }))

const db = "mongodb://localhost/DB_DEMO";
mongoose.connect(db, err => {
    if (err) {
        console.log('Error in connect the database' + err);
    } else {
        console.log('Connected to Mongodb');
    }
});
app.get('/', (req, res) => {
    res.render('login.ejs', { login_failed: false, success: false })
});

app.use(session({
    secret: 'keyboard cat',
}))


app.get('/register', (req, res) => {
    res.render('register.ejs', { already: false })
})

app.post('/register', (req, res) => {

    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const password = req.body.password;

    User.find({ "email": req.body.email })
        .then(

            
            result => {
                //email id already exist
                if (result.length !== 0) {
                    res.render('register.ejs', { success: false, already: true })

                } else {
                    // user info save
                    console.log(req.body)
                    let userData = req.body
                    let user = new User(userData)
                    //user._id = new mongoose.Types.ObjectId()
                    console.log(user);
                    user.save()
                        .then(
                            result => {
                                res.render('login.ejs', { success: true, login_failed: false })
                            }
                        )
                        .catch(
                            error => {
                                res.send('error')
                            }
                        )
                }
            }
        )
        .catch(
            error => {
                res.render('login.ejs', { login_failed: true })
            }
        )
});



app.post('/', (req, res) => {
    User.find({ "email": req.body.email, "password": req.body.password })

        .then(
            result => {

                req.session._id = result[0]._id

                console.log(req.session._id);

                if (result.length == 1) {
                    res.redirect('/upload');

                } else {

                    console.log(req.body)

                        .then(
                            result => {
                                res.render('login.ejs', { login_failed: true, success: false })
                            }
                        )
                        .catch(
                            error => {
                                res.render('login.ejs', { login_failed: true, success: false })
                            }
                        )
                }
            }
        )
        .catch(
            error => {
                res.render('login.ejs', { login_failed: true, success: false })
            }
        )

})

app.get('/upload', (req, res) => {

    if (req.session._id) {

        res.render('upload.ejs', { success: false })
    }
    else {
        res.render('login.ejs', { login_failed: true })
    }
});

app.post('/upload', (req, res) => {
    const file_read = req.body.csv_file;
    console.log(file_read);
    const results = [];

    amqp.connect('amqp://localhost', function (error0, connection) {
        if (error0) {
            throw error0;
        }
        //Channel is application session that is opened for each piece of your app to communicate with the RabbitMQ broker 
        connection.createChannel(async (error1, channel) => {
            if (error1) {
                throw error1;
            }

            var queue = 'hello';
            // var msg = 'Hello World!';

            //read data from a source and pipe it to a destination
            //await fs.createReadStream('data.csv').on('error', () => {
            await fs.createReadStream('out.csv').on('error', () => {
                console.log('error');
            })
                .pipe(csv())
                .on('data', async (jsonObj) => {
                    await results.push(jsonObj)
                })
                .on('end', async () => {
                    try {
                        var count = await Object.keys(results).length;

                        // var chunk = 2;
                        var chunk = 1000;

                        var temp = count / chunk;
                        console.time();
                        let start = Date.now();
                        for (var i = 0; i < temp; i++) {
                            let first = 0 + (i * chunk);
                            let last = chunk + (i * chunk);
                            const data = await results.slice(first, last);
                            //console.log(data)
                            try {
                                channel.assertQueue(queue, {
                                    durable: false
                                });

                                //put a message onto "hello" queue.
                                await channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
                                let end = Date.now();
                                console.log("Sent Batch in." + (end - start) / 1000 + "sec");
                                // console.log(" [x] Sent %s", data);
                            } catch (e) {
                                console.log("Insert Error ::" + e)
                            }
                        }

                    } catch (e) {
                        console.log('file is not opening')
                    }

                });

        });
    });
    res.render('upload.ejs', { success: true });
})

app.get('/destroy', (req, res) => {
    req.session.destroy(function (error) {
        console.log("Session Destroyed")
    })
    res.redirect('/')
});

app.get('/fetch', (req, res) => {
    fetch_data.find({})
        .then(
            result => {
                console.log(result)
                res.render('view.ejs',{result : result})
            }
        )
        .catch(
            error => {
                console.log('error')

            }
        )

})
app.listen(3000)