var express = require('express');
var cors = require('cors');
var app = express();
var request = require('request');
var path = require('path');
var server = require('http').createServer(app);

app.use(cors());
app.options('*', cors());


var BREW_API_URL = "https://api.brewerydb.com/v2/locations/?name&key=52840d61aed0d4d4dc14a975bf3092c4&format=json";


app.get('/', function(req, res, next) {
    // https://codeforgeek.com/2015/01/render-html-file-expressjs/
    res.sendFile(path.join(__dirname + '/public/brew.html'))
})

app.get('/breweries', function(req, res, next) {
    // https://stackoverflow.com/questions/8515872/simple-api-calls-with-node-js-and-express
    request(BREW_API_URL, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // https://stackoverflow.com/questions/19696240/proper-way-to-return-json-using-node-or-express
          res.json(body);
      } else {
          res.send(error);
      }
    });
})


app.use(express.static(__dirname + '/public'));

server.listen(3000);
