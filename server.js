var express = require('express');

var app = express();
var fs = require("fs");
var path = require("path");
var sizeOf = require('image-size');
var bodyParser = require('body-parser');
var multer = require('multer');
var gm = require('gm').subClass({imageMagick: true});



app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

app.use(express.static(__dirname));

function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

function random (low, high) {
    var random = Math.random() * (high - low) + low
    return Math.floor(random);
}

function getFileExt(mime){
    var type = ".jpeg";
    switch(mime.toLowerCase())
    {
        case 'image/png':
            type = '.png';
            break;
        case 'image/jpeg':
            type = '.jpeg';
            break;
        case 'image/gif':
            type = '.gif';
            break;
    }
    return type;
}

app.post("/img_save_to_file",function(req, res, next){

    var files = req.files.img;
    var dimensions = sizeOf(files.path);


    fs.readFile(files.path, function (err, data) {
        if(err){
            res.json({
                status:"error",
                message:"Can`t read uploaded File"
            });
        }
        var imagePath = "/temp/"+files.originalname;

        var newPath = path.normalize(__dirname+""+imagePath);
        fs.writeFile(newPath, data, function (err) {
            if(err){
                res.json({
                    status:"error",
                    message:"Can`t write uploaded File"
                });
            }
            if ((imagePath).indexOf('/') === 0){
                imagePath = (imagePath).substring(1);
            }
            console.log(imagePath,'imagePath');
            var response = {
                status:"success",
                url:imagePath,
                width:dimensions.width,
                height:dimensions.height
            };
            console.log(response,'response');
            res.json(response);
        });
    });

});

app.post("/img_crop_to_file",function(req, res, next){
    var fileData =  req.body;
    var imagePath;
    var imageExt;

    //Differentiate if imgUrl value is path or base64
    //TODO: Revisit this condition checking
    try {
        imagePath = fileData.imgUrl;
        if ((fileData.imgUrl).indexOf('/') === 0){
            imagePath = (fileData.imgUrl).substring(1);
        }
        fs.openSync(imagePath, 'r');
        imageExt = path.extname(fileData.imgUrl);

    } catch (e){
        var imageBuffer = decodeBase64Image(fileData.imgUrl);
        imagePath  = imageBuffer.data;
        imageExt = getFileExt(imageBuffer.type);

    }
    var output_file = 'temp/cropped_'+random(1,10000000)+''+imageExt;

    gm(imagePath)
        //.rotate('green', fileData.rotation)
        .resize(fileData.imgW,fileData.imgH)
        .crop(fileData.cropW, fileData.cropH,fileData.imgX1, fileData.imgY1)
        .write(output_file, function (err,data) {
            if(err) {
                res.json({
                    status:"error",
                    message:"Can`t write cropped File"
                });
            }

            res.json({
                status:"success",
                url:output_file
            });
        });

});



var server = app.listen(8080, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);

});
