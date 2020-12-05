// importing modules 
var mongoose = require('../db').mongoose; 
var Schema = mongoose.Schema; 


var PlantSchema = new Schema({ 
    mac: String,
    imageURLs: [{ url: String, datetime: Date }],
    moistureReadings: [{ moisture: Number, datetime: {type: Date, default: Date.now} }],
    owner: String,
    lastRotate: Date,
}); 

// export userschema 
module.exports = mongoose.model("Plant", PlantSchema); 