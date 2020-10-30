const express = require('express')
const app = express()
const mongoose = require('mongoose')
const passport = require('passport')
require('dotenv').config()
const User = require('./models/user');
const router = express.Router();
const aws = require('./awshelper.js');

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
const connection = mongoose.connection
connection.once('open', () => {
	console.log("MongoDB connected.")
});

app.use(passport.initialize())
app.use(passport.session())
app.use(express.json());
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(User.authenticate()));

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	next();
});

app.get('/', (req, res) => {
  //res.send(testObj)
  res.send("Hi!")
})

app.post('/api/auth/create', function(req, res) {
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

let key = aws.uploadFile("./test.jpg", "testing").then((response) => aws.signUrl(response)).then((response) => console.log(response))

app.listen(process.env.PORT, () => {
	console.log(`Example app listening at http://localhost:${process.env.PORT}`)
})
