const mongoose = require("mongoose");
const { MongoClient, ServerApiVersion } = require("mongodb");

const databaseName = "events_database";
const uri4 =
	"mongodb+srv://a:a@cluster0.u7d4v.mongodb.net/events_database?retryWrites=true&w=majority";

const connectionURL = process.env.DB_PROD + databaseName; //for localhost

if (process.env.okruzenje == "production") {
	dbString = uri4;
} else {
	dbString = connectionURL;
}

mongoose.connection.on("open", function () {
	console.log(" povezan si s bazom!");
});

mongoose
	.connect(uri4, {
		useNewUrlParser: true,
		useUnifiedTopology: false,
		// retryWrites: true,
		// w: "majority",
		serverApi: ServerApiVersion.v1,
	})
	.catch((e) => {
		console.log("Err \n", e);
	});
