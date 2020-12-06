// importing modules 
const express = require('express'); 
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');


router.post('/create', function(req, res) {
	console.log(req.body)
	Users=new User({email: req.body.email, username : req.body.username}); 
	User.register(Users, req.body.password, function(err, user) { 
		if (err) {
			res.json({success:false, message:"Your account could not be saved. Error: ", err}) 
		}else{
			res.json({success: true, message: "Your account has been saved"}) 
		}
	});
});

// sign in
router.post("/login", passport.authenticate('local'), (req, res) => {
	res.send('{ "success": true }');
	console.log(req.isAuthenticated());
})

// sign out
router.post("/logout", (req, res) => {
	req.logout();
	res.send('{ "success": true }');
})

// get name
router.get("/username", (req, res) =>{
	if(req.isAuthenticated()){
		res.send(`{ "name": "${req.user.username}" }`);
	}
	else{
		res.send('{ "error": "Not signed in" }');
	}
})

// list plants by name

// list plants by name and MAC

// add plant

// add device to notification

// delete device from notification system

module.exports = {
	router,
}
