const express = require('express'); 
const router = express.Router();

//let key = aws.uploadFile("./test.jpg", "testing").then((response) => aws.signUrl(response)).then((response) => console.log(response))

// process image sent by plant
router.post("/uploadImage", (req, res) => {

})

// process moisture data sent by plant

module.exports = {
	router,
}