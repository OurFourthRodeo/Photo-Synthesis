const mongoose = require('mongoose')

// Connect to database.
mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
const connection = mongoose.connection
connection.once('open', () => {
	console.log("MongoDB connected.")
});



module.exports = {
	mongoose,
}