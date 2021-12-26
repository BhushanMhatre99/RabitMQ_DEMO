const mongoose = require('mongoose');
const Schema= mongoose.Schema;

const fetch= new Schema({
    Id : {type: String, required:true},
    Name : {type: String, required:true},
    Email : {type: String, required:true},
    Phone_no : {type: String, required:true}
});


module.exports = mongoose.model('client',fetch, 'client');
