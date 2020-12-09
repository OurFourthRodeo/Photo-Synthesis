// importing modules 
var mongoose = require('../db').mongoose; 
var Schema = mongoose.Schema; 


var PlantSchema = new Schema({ 
    _id: String, // The MAC address, guaranteed to be unique.
    imageURLs: [{ url: String, datetime: {type: Date, default: Date.now()} }],
    moistureReadings: [{ moisture: Number, datetime: {type: Date, default: Date.now() } }],
    owner: String,
    lastRotate: Date,
    lastWaterNotify: Date,
    readyForHarvest: Boolean,
    readyForElectrodes: Boolean,
}); 

// export userschema 
module.exports = mongoose.model("Plant", PlantSchema); 