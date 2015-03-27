var express = require('express');

var app = express();
var fs = require("fs");
var path = require("path");
var sizeOf = require('image-size');



var bodyParser = require('body-parser');
var multer = require('multer');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

app.use(express.static(__dirname));


app.post("/save-file",function(req, res, next){

    var files = req.files.img;
    var dimensions = sizeOf(files.path);

    fs.readFile(files.path, function (err, data) {
        var imagePath = "/temp/"+files.originalname;
        var newPath = path.normalize(__dirname+""+imagePath);
        fs.writeFile(newPath, data, function (err) {
            res.json({
                status:"success",
                url:imagePath,
                width:dimensions.width,
                height:dimensions.height
            });
        });
    });

});

app.listen(8080);
