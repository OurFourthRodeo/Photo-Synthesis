const express = require('express'); 
const router = express.Router();
const fs = require("fs");
const aws = require("../awshelper");
const { platform } = require('os');
const Plant = require("../models/plant")

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
                    Plant.updateOne({_id: mac}, {$push: {"imageURLs": {"url": response.key, "datetime": new Date()}}}, {upsert: true})
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
router.post("uploadMoisture/", (req, res) => {
    // Should be received as octet stream, need to parse out first 6 bytes
    if(req.body.length > 6){
        mac = req.body.toString("hex").substring(0,12)
        moisture = parseInt(Number(req.body.toString("hex").substring(12,20)), 10);
        Plant.updateOne({_id: mac}, {$push: {"moistureReadings": {"moisture": moisture, "datetime": new Date()}}}, {upsert: true})
            .exec().then((doc) =>{
                console.log(doc);
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