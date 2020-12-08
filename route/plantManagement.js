const express = require('express'); 
const router = express.Router();
const Plant = require('../models/plant')
const User = require('../models/user')
const aws = require('../awshelper');

//let key = aws.uploadFile("./test.jpg", "testing").then((response) => aws.signUrl(response)).then((response) => console.log(response))

// get plant's most recent photo
// (sign it)
router.get("/photo", (req, res) =>{
    if(req.isAuthenticated()){
		Plant.findOne({"_id": req.query.id}).exec().then( (doc, err) =>{
			if(err){
				res.send({ "error": "Yikes."});
			}
			if(!doc){
				res.send({"error": "No document"});
				return;
			}
			if(!doc.imageURLs || !doc.owner){
				res.send({"error": "Missing fields, please wait"})
				return;
			}
			if(doc.owner != req.user.username){
				res.send({"error": "Plant does not belong to requester"});
				return;
			}
			
			images = doc.imageURLs;
            images.sort( (a, b) => {
                return new Date(b.datetime) - new Date(a.datetime);
            });
            res.send({"url": aws.signUrl(images[0].url)});
		})
	}
	else{
		res.send({ "error": "Not signed in" });
	}
})

// get plant's most recent x number of photos, if they exist
// (sign them)

// get plant's most recent moisture reading
router.get("/moisture", (req, res) =>{
    if(req.isAuthenticated()){
		Plant.findOne({"_id": req.query.id}).exec().then( (doc, err) =>{
			if(err){
				res.send({ "error": "Yikes."});
			}
			if(!doc){
				res.send({"error": "No document"});
				return;
			}
			if(!doc.moistureReadings || !doc.owner){
				res.send({"error": "Missing fields, please wait"})
				return;
			}
			if(doc.owner != req.user.username){
				res.send({"error": "Plant does not belong to requester"});
				return;
			}
			moisture = doc.moistureReadings;
            images.sort( (a, b) => {
                return new Date(b.datetime) - new Date(a.datetime);
            });
            res.send({"moisture": moisture[0]});
		})
	}
	else{
		res.send({ "error": "Not signed in" });
	}
})

// get plant's most recent x moisture readings

// get plant's name
router.get("/name", (req, res) => {
	if(req.isAuthenticated()){
		User.findOne({username: req.user.username}).exec().then( (doc, err) =>{
			if(err){
				res.send({ "error": "Yikes."});
			}
			res.send({"name": doc.plants.find(p => p.mac === req.query.id).name});
		})
	}
	else{
		res.send({ "error": "Not signed in" });
	}
})

module.exports = {
    router,
}