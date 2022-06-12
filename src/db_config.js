const mongoose = require("mongoose");

const connectionURL = "mongodb://127.0.0.1:27017/";
const databaseName = "events_database";

mongoose.connection.on("open", function () {
	console.log(" povezan si s bazom!");
});

mongoose.connect("mongodb://127.0.0.1:27017/" + databaseName, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
