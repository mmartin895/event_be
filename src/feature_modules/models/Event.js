const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema({
	name: {
		required: true,
		type: String,
	},
	description: {
		type: String,
	},
	img: {
		type: Buffer,
		// contentType: String,
	},
	thumbnail: {
		type: Buffer,
		// contentType: String,
	},
	location: {
		required: true,
		type: String,
	},
	startTime: {
		required: true,
		type: Date,
	},
	eventType: {
		required: true,
		type: String,
	},
	endTime: {
		required: true,
		type: Date,
	},
	organizer: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
	latlong: {
		type: Object,
		lat: Number,
		lng: Number,
	},
});

eventSchema.virtual("tickets", {
	ref: "TicketInstance",
	localField: "_id",
	foreignField: "event",
});

const Event = new mongoose.model("Event", eventSchema);

module.exports = { Event };
