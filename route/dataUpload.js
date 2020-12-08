const express = require('express'); 
const router = express.Router();
const fs = require("fs");
const aws = require("../awshelper");
const { platform } = require('os');
const Plant = require("../models/plant");
const User = require("../models/user");
const { Expo } = require('expo-server-sdk')

let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

// process image sent by plant
router.post("/uploadImage", (req, res) => {
    // Should be received as octet stream, need to parse out first 6 bytes
    if(req.body.length > 6){
        mac = req.body.toString("hex").substring(0,12)
        title = "./upload/"+mac+"_"+(new Date().getTime())+".jpg";
        fs.writeFile(title, req.body.slice(6, req.body.length), "binary", err => {
            if(err){
                console.log("Could not save file.")
                res.send({"error": "Could not save image"})
            }
            else{
                console.log("Success!");
                res.send({"success": "Saved image."})
                aws.uploadFile(title, mac).then((response) => {
                    Plant.findOneAndUpdate({_id: mac}, {$push: {"imageURLs": {"url": response.key, "datetime": new Date()}}}, {upsert: true, new: true})
                        .exec().then((doc) =>{
                            console.log(doc);
                            fs.unlinkSync(title);
                        });
                })
            }
        })
    }
    else{
        res.send({"error": "Invalid request."});
    }
})

// process moisture data sent by plant
router.post("/uploadMoisture", (req, res) => {
    // Should be received as octet stream, need to parse out first 6 bytes
    console.log(req.body);
    if(req.body.length > 6){
        mac = req.body.toString("hex").substring(0,12)
        moisture = req.body.readInt32LE(6);
	console.log(moisture);
        Plant.findOneAndUpdate({_id: mac}, {$push: {"moistureReadings": {"moisture": moisture, "datetime": new Date()}}}, {upsert: true})
            .exec().then((doc) =>{
		if(doc.owner){
			User.findOne({"username": doc.owner}, (userDoc) => {
				if(userDoc && userDoc.devices){
					// prepare notifications
					let messages = [];
					userDoc.devices.forEach((element) =>{
						messages.push({
							to: element,
							sound: 'default',
							body: 'Your plant is low on water!',
							data: {withSome: 'data'},
						});
					});
					let chunks = expo.chunkPushNotifications(messages);
					let tickets = [];
					(async () => {
					// Send the chunks to the Expo push notification service. There are
  					// different strategies you could use. A simple one is to send one chunk at a
					// time, which nicely spreads the load out over time:
						for (let chunk of chunks) {
    							try {
      								let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      								console.log(ticketChunk);
      								tickets.push(...ticketChunk);
							} catch (error) {
								console.error(error);
							}
						}
					})();
				}
			})
		}
                res.send({"success": "Saved data."})
            });
    }
    else{
        res.send({"error": "Invalid request."});
    }
})

module.exports = {
	router,
}
