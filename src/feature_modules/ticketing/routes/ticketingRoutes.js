const { Router } = require("express");
const { verifyToken } = require("../../auth/middleware/authMiddleware");
const webpush = require("web-push");
const { logTicketPurchase } = require("../services/ticketingServices");

const ticketingRouter = Router();

ticketingRouter.post("/purchase", verifyToken, async (req, res) => {
	try {
		const payload = req.body;
		const user = req.user;
		const savedTickets = await logTicketPurchase(payload, user);
		console.log(savedTickets);

		res.status(200).send("Ticket purchase succesfull");
	} catch (err) {
		res.status(400).send(err.message);
	}
});

ticketingRouter.get("/protected", verifyToken, async (req, res) => {
	console.log(req.user);
	res.send(" ok is good");
});

module.exports = ticketingRouter;
