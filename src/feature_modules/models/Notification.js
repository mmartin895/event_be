const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
	title: {
		required: true,
		type: String,
	},
	body: {
		type: String,
	},
	event: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Event",
	},
});

const Notification = new mongoose.model("Notification", notificationSchema);

module.exports = { Notification };
