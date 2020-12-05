const express = require('express'); 
const router = express.Router();

//let key = aws.uploadFile("./test.jpg", "testing").then((response) => aws.signUrl(response)).then((response) => console.log(response))
router.post("/uploadTest", (req, res) => {
	console.log(req.headers);
	console.log(req.body);
	res.send("Thanks!");
})

module.exports = {
	router,
}