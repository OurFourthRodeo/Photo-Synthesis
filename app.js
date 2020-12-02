const express = require('express')
const app = express()
const mongoose = require('mongoose')
const passport = require('passport')
require('dotenv').config()
const UserRoutes = require('./route/user')
const router = express.Router();
const aws = require('./awshelper.js');
const User = require('./models/user');

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

app.use(UserRoutes.router);

app.listen(process.env.PORT, () => {
	console.log(`API app listening at http://localhost:${process.env.PORT}`)
})
