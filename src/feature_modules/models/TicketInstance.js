const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TicketInstanceSchema = new Schema({
	ticketName: {
		required: true,
		type: String,
	},
	description: {
		type: String,
	},
	quantity: {
		type: Number,
		required: true,
	},
	ticketPrice: {
		type: Number,
		required: true,
	},
    event: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Event",
	},
});

const TicketInstance = new mongoose.model(
	"TicketInstance",
	TicketInstanceSchema
);

module.exports = { TicketInstance };
