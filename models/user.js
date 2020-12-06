// importing modules 
var mongoose = require('../db').mongoose; 
var Schema = mongoose.Schema; 
var passportLocalMongoose = require('passport-local-mongoose'); 


var UserSchema = new Schema({ 
	email: {type: String, required:true, unique:true}, 
	username : {type: String, unique: true, required:true}, 
	plants: [{mac : String, name: String}],
	devices: [String]
}); 

// plugin for passport-local-mongoose 
UserSchema.plugin(passportLocalMongoose); 

// export userschema 
module.exports = mongoose.model("User", UserSchema); 
