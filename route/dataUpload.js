const express = require('express'); 
const router = express.Router();
const multer = require('multer');
const aws = require('../awshelper');

//let key = aws.uploadFile("./test.jpg", "testing").then((response) => aws.signUrl(response)).then((response) => console.log(response))
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        console.log(req.body);
        cb(null, req.body.device + "_" + Date.now() + '.jpg') //Appending .jpg
    }
  })
const upload = multer({dest: 'uploads/', storage: storage});

router.post('/uploadImage', upload.single('image'), (req, res) => {
    console.log(req.file);
    console.log(req.body)
    res.send({"success": true});
})

module.exports = {
	router,
}