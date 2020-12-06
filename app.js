const express = require('express');
const app = express();
const passport = require('passport');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var MongoStore = require('connect-mongo')(expressSession);
require('dotenv').config();

const db = require("./db").connection;
const UserRoutes = require('./route/user');
const DataUploadRoutes = require('./route/dataUpload');
const PlantManagementRoutes = require('./route/plantManagement');

// Configure body parser to expect images and moisture
// data from the ESP32
var options = {
  inflate: true,
  limit: '100kb',
  type: 'application/octet-stream'
};
app.use(bodyParser.raw(options));

// Configure User model for use with Passport
const User = require('./models/user');
app.use(expressSession({
	store: new MongoStore({ mongooseConnection: db }),
	secret: process.env.SESSIONSECRET,
	resave: false,
	saveUninitialized: false,
	cookie: { sameSite: 'strict' },
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Configure strategy for Passport -- local for rolling our own
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(User.authenticate()));

// CORS configuration to allow access from React app
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	next();
});

// Test endpoint, pls ignore.
app.get('/', (req, res) => {
  //res.send(testObj)
  res.send("Hi!")
});

//let key = aws.uploadFile("./test.jpg", "testing").then((response) => aws.signUrl(response)).then((response) => console.log(response))
app.use("/api/user/v1", UserRoutes.router);
app.use("/api/dataUpload/v1", DataUploadRoutes.router);
app.use("/api/plantManagement/v1", PlantManagementRoutes.router);

app.listen(process.env.PORT, () => {
	console.log(`API app listening at http://localhost:${process.env.PORT}`)
});
