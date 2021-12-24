const express = require('express');
const app = express()
const path = require('path');
const bodyparser = require("body-parser");
const session = require('express-session');
const User = require('./models/users');

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

app.use(session({
    secret: 'keyboard cat',
}))


app.get('/register', (req, res) => {
    return res.sendFile('register.html', { root: __dirname });
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
                    res.send('error1')

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
                                res.redirect('/login', { 'success': 'sucess' })
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
                res.sendFile('login.html', { root: __dirname });
            }
        )
});

app.get('/', (req, res) => {
    res.sendFile('login.html', { root: __dirname });
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
                                res.send('error4')
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
                res.send('error')
            }
        )

})

app.get('/upload', (req, res) => {

    if (req.session._id) {

        res.sendFile('upload.html', { root: __dirname });
    }
    else {
        res.send('session not maintain')
    }
});
app.get('/destroy', (req, res) => {
    req.session.destroy(function (error) {
        console.log("Session Destroyed")
    })
    res.redirect('/')
});

app.listen(3000)