// importing modules 
const express = require('express'); 
const router = express.Router();
const User = require('../models/user');


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

// sign out

// add plant

// add device to notification

// delete device from notification system

module.exports = {
	router,
}
