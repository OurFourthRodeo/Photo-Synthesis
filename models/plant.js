// importing modules 
var mongoose = require('../db').mongoose; 
var Schema = mongoose.Schema; 


var PlantSchema = new Schema({ 
    _id: String, // The MAC address, guaranteed to be unique.
    imageURLs: [{ url: String, datetime: Date }],
    moistureReadings: [{ moisture: Number, datetime: {type: Date, default: Date.now} }],
    owner: String,
    lastRotate: Date,
}); 

// export userschema 
module.exports = mongoose.model("Plant", PlantSchema); 