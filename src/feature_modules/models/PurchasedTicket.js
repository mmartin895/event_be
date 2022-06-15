const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PurchasedTicketSchema = new Schema(
	{
		ticket: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "TicketInstance",
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		event: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Event",
		},
		quantity: {
			type: Number,
			required: true,
		},
	},
	{
		timestamps: {
			createdAt: "createdAt",
			updatedAt: "updatedAt",
		},
	}
);

const PurchasedTicket = new mongoose.model(
	"PurchasedTicket",
	PurchasedTicketSchema
);

module.exports = { PurchasedTicket };
