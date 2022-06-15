const { PurchasedTicket } = require("../../models/PurchasedTicket");
var valid = require("card-validator");

const logTicketPurchase = async (paylod, user) => {
	const { creditDetails, selectedTickets, tickets } = paylod;

	const { number } = creditDetails;
	if (tickets.length <= 0) {
		throw new Error("No tickets selected");
	}
	confirmCredicardDetails(creditDetails);
	const savedTickets = [];

	for (const ticket of tickets) {
		const ticketToSave = { ...ticket, user: user._id };
		const savedTicketPurchase = await new PurchasedTicket(ticketToSave).save();
		savedTickets.push(savedTicketPurchase);
	}

	// console.log(creditDetails, tickets);

	return savedTickets;
};

const confirmCredicardDetails = ({ number }) => {
	if (!valid.number(number).isValid) {
		throw new Error("Credit card number invalid");
	}
	return;
};

module.exports = { logTicketPurchase };
