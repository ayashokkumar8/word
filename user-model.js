var express= require ('express');
var router = express.Router();
var lan = require('./data/languages.json');
var fs=require('fs');

/*Get Home Page*/

router.get('/selectLanguage', function(req, res){
    res.render('main', {



        languagedata:lan

    });

});






var ret = {translations : []};

masterFile.forEach(function (line) {
    var obj = {};
    obj["key"] = myKey;


    languages.forEach(function (language) {
            var translation = ... read translation
            obj[language] = tranlation;
        }
    );

    ret.translation.push(obj);

});

















/*
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mydb');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: String,
    password: String
});

var User = mongoose.model('User', userSchema);

module.exports = User;
*/