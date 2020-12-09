const express = require('express'); 
const router = express.Router();
const fs = require("fs");
const aws = require("../awshelper");
const { platform } = require('os');
const Plant = require("../models/plant");
const User = require("../models/user");
const { Expo } = require('expo-server-sdk')
const { PythonShell } = require('python-shell');

let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

// process image sent by plant
router.post("/uploadImage", (req, res) => {
    // Should be received as octet stream, need to parse out first 6 bytes
        if(req.body.length > 6){
            mac = req.body.toString("hex").substring(0,12)
	    location = "./upload/"
            title = mac+"_"+(new Date().getTime())+".jpg";
            fs.writeFile(location+title, req.body.slice(6, req.body.length), "binary", err => {
            if(err){
                console.log("Could not save file.")
                res.send({"error": "Could not save image"})
            }
            else{
                console.log("Success!");
                 res.send({"success": "Saved image."});
                // Process image
                options = {
                    mode: 'text',
		    scriptPath: './computervision/',
                    args: [location+title],
                }
                PythonShell.run('predictGrowth.py', options, (err, results) => {
			if(err){
				console.log("Could not upload.");
				fs.unlinkSync(location+title);
			}
			jsonRes = JSON.parse(results[0].split("'").join(`"`));
			console.log(jsonRes);
			aws.uploadFile(location+title, mac).then((response) => {
                        	Plant.findOneAndUpdate({_id: mac}, {$push: {"imageURLs": {"url": response.key, "datetime": new Date()}}}, {upsert: true, new: true})
                            		.exec().then((doc) =>{
                         		//console.log(doc);
                        		 fs.unlinkSync(location+title);
                     		});
                	})
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
    // console.log(req.body);
    if(req.body.length > 6){
        mac = req.body.toString("hex").substring(0,12)
        moisture = req.body.readInt32LE(6);
        Plant.findOneAndUpdate({_id: mac}, {$push: {"moistureReadings": {"moisture": moisture, "datetime": new Date()}}}, {upsert: true})
            .exec().then((doc) =>{
		if(doc.owner){
			User.findOne({"username": doc.owner}).exec().then((userDoc) => {
				if(userDoc && userDoc.devices){
                    // prepare notifications
                    sendRotateNotif = true;
                    if(doc.lastRotate){
                        lastNotif = new Date(doc.lastRotate);
                        now = new Date();
                        diffMs = Math.abs(lastNotif - now);
                        diffDays = Math.floor(diffMs / 86400000);
                        console.log("Time since last notification:", diffMs, diffDays);
                        if(diffDays < 7){
                            sendRotateNotif = false;
                        }
                    }
                    else{
                        Plant.updateOne({_id: mac}, {lastRotate: new Date()}).exec();
                        sendRotateNotif = false;
                    }
                    if(sendRotateNotif){
                        let messages = [];
                        userDoc.devices.forEach((element) =>{
                            // console.log(element)
                            messages.push({
                                to: element,
                                sound: 'default',
                                title: "Robotany",
                                body: "Don't forget to rotate your plant!",
                                data: {withSome: 'data'},
                            });
                        });
                        let chunks = expo.chunkPushNotifications(messages);
                        let tickets = [];
                        (async () => {
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
                        Plant.updateOne({_id: mac}, {lastRotate: new Date()}).exec();
                    }
                    if(moisture < 1024){
                        sendMoistureNotif = true;
                        if(doc.lastWaterNotify){
                            lastNotif = new Date(doc.lastWaterNotify);
                            now = new Date();
                            diffMs = Math.abs(lastNotif - now);
                            diffHours = Math.floor((diffMs % 86400000) / 3600000);
                            console.log("Time since last notification:", diffMs, diffHours);
                            if(diffHours < 3){
                                sendMoistureNotif = false;
                            }
                        }
                        if(sendMoistureNotif){
                            let messages = [];
                            userDoc.devices.forEach((element) =>{
                                // console.log(element)
                                messages.push({
                                    to: element,
                                    sound: 'default',
                                    title: "Robotany",
                                    body: 'Your plant is low on water!',
                                    data: {withSome: 'data'},
                                });
                            });
                            let chunks = expo.chunkPushNotifications(messages);
                            let tickets = [];
                            (async () => {
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
                            Plant.updateOne({_id: mac}, {lastWaterNotify: new Date()}).exec();
                        }
                    }
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
