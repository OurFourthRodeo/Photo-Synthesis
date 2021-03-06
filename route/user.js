// importing modules 
const express = require('express'); 
const router = express.Router();
const User = require('../models/user');
const Plant = require('../models/plant');
const passport = require('passport');


router.post('/create', function(req, res) {
	//console.log(req.body)
	Users=new User({email: req.body.email, username : req.body.username}); 
	User.register(Users, req.body.password, function(err, user) { 
		if (err) {
			res.send({success:false, message:"Your account could not be saved. Error: ", err}) 
		}else{
			console.log("Created account!");
			res.send({success: true, message: "Your account has been saved"}) 
		}
	});
});

// sign in
router.post("/login", passport.authenticate('local'), (req, res) => {
	//console.log("Login request received and through passport");
	res.send({ "success": true });
	console.log(req.isAuthenticated());
})

// sign out
router.post("/logout", (req, res) => {
	req.logout();
	res.send({ "success": true });
})

// get name
router.get("/username", (req, res) =>{
	if(req.isAuthenticated()){
		res.send({ "name": req.user.username });
	}
	else{
		res.send({ "error": "Not signed in" });
	}
})

// Getting info on plants in account
router.get("/plants", (req, res) => {
	if(req.isAuthenticated()){
		User.findOne({username: req.user.username}).exec().then( (doc, err) =>{
			if(err){
				res.send({ "error": "Yikes."});
			}
			// list plants by name and MAC
			if (req.query.all == 1){
				res.send(doc.plants)
			}
			// list plants by name
			else{
				res.send(doc.plants.map(r => r.name))
			}
		})
	}
	else{
		res.send({ "error": "Not signed in" });
	}
})

// add plant
router.post("/addPlant", (req, res) => {
	if(req.isAuthenticated()){
		if(req.body.name && req.body.mac){
			plant = {name: req.body.name, mac: req.body.mac};
			// add plant to user object
			condition = {"username": req.user.username, "plants.mac": {$ne: req.body.mac} }
			User.findOneAndUpdate(condition, {$push : {"plants": plant}}, {new: true})
				.exec().then((doc) => {
					if(doc){
						res.send(doc.plants);
						// TODO
						// add plant (if it doesn't exist) and add owner
						Plant.updateOne({_id: req.body.mac}, {"owner": req.user.username}, {upsert: true}).exec().then((doc) =>{
							console.log("Created or updated plant object for user.")
							console.log(doc);
						});
					}
					else{
						empty = []
						res.send(empty);
					}
				})
		}
		else{
			console.log(`Name: ${req.body.name}, MAC: ${req.body.mac}`);
			console.log(req.body)
			res.send({"error": "Details missing"});
		}
	}
	else{
		res.send({"error": "Not signed in"})
	}
})

// delete plant
router.post("/deletePlant", (req, res) => {
	if(req.isAuthenticated()){
		if(req.body.mac){
			User.findOneAndUpdate({"username": req.user.username}, {$pull: {"plants": {"mac": req.body.mac}}}, {new: true})
				.exec().then((doc) => {
					res.send(doc.plants)
				})
			Plant.deleteOne({"_id": req.body.mac}).exec().then((doc) =>{
				console.log("Deleted plant object.");
				console.log(doc);
			})
		}
		else{
			res.send({ "error": "No plant provided" });
		}
	}
	else{
		res.send({ "error": "Not signed in" });
	}
})

// add device to notification
router.post("/registerDevice", (req, res) => {
	console.log("Adding device:", req.body.device, req.isAuthenticated());
	if(req.isAuthenticated()){
		if(req.body.device){
			condition = {"username": req.user.username, 'devices': {$ne: req.body.device}}
			User.findOneAndUpdate(condition, {$push : {"devices": req.body.device}}, {new: true})
				.exec().then((doc, err) => {
					if(doc){
						res.send(doc.devices);
					}
					else{
						empty = []
						res.send(empty);
					}
				})
		}
		else{
			res.send({ "error": "No device specified." });
		}
	}
	else{
		res.send({ "error": "Not signed in" });
	}
})

// delete device from notification system
router.post("/unregisterDevice", (req, res) => {
	if(req.isAuthenticated()){
		if(req.body.device){
			User.findOneAndUpdate({"username": req.user.username}, {$pull: {"devices": req.body.device}}, {new: true})
				.exec().then((doc) => {
					res.send(doc.devices)
				})
		}
		else{
			res.send({ "error": "No device specified." });
		}
	}
	else{
		res.send({ "error": "Not signed in" });
	}
})

module.exports = {
	router,
}
