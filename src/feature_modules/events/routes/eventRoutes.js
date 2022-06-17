const { Router } = require("express");
const {
	createEvent,
	createEventWithPic,
	getAllEvents,
	getEvent,
	transformImageToSrc,
	getSearchedEvents,
	addEventTickets,
	editEventPic,
	notifyAtendees,
} = require("../services/eventServices");
const multer = require("multer");
const { Event } = require("../../models/Event");
const { verifyToken } = require("../../auth/middleware/authMiddleware");
const { TicketInstance } = require("../../models/TicketInstance");
const { PurchasedTicket } = require("../../models/PurchasedTicket");

const authRouter = Router();

const upload = multer({
	limits: {
		fileSize: 2000000,
	},
	fileFilter(req, file, cb) {
		console.log(file.originalname);
		if (file && !file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			console.log(file.originalname);
			return cb(new Error("Please upload an image"));
		}

		cb(undefined, true);
	},
});

authRouter.post("/create", async (req, res) => {
	try {
		const event = await createEvent(req.body);
		res.status(201).send(event);
	} catch (err) {
		console.log(err);
		res.send(err.message);
	}
});

authRouter.patch("/tickets", verifyToken, async (req, res) => {
	try {
		const ticket = req.body;
		const { _id } = ticket;
		delete ticket._id;

		const ticketToUpdate = await TicketInstance.findOne({ _id: _id });
		const relatedEvent = await Event.findOne({ _id: ticketToUpdate.event });

		if (
			!(
				relatedEvent.organizer == req.user._id || req.user.userRole == "admin"
			) ||
			ticket.event
		) {
			console.log("not authorized!");
			res.status(403).send({
				message: "You are unauthorized to updathe this ticket!",
			});
		} else {
			console.log("You are authorized");

			ticketToUpdate.ticketName = ticket.ticketName;
			ticketToUpdate.ticketPrice = ticket.ticketPrice;
			ticketToUpdate.quantity = ticket.quantity;
			await ticketToUpdate.save();

			res.status(200).send("Ticket updated!");
		}
	} catch (err) {
		console.log(err);
		res.status(400).send(err.message);
	}
});

authRouter.post("/tickets/delete", verifyToken, async (req, res) => {
	try {
		const ticketId = req.body.ticketId;
		const ticketToDelete = await TicketInstance.findOne({ _id: ticketId });
		const relatedEvent = await Event.findOne({ _id: ticketToDelete.event });

		if (
			!(relatedEvent.organizer == req.user._id || req.user.userRole == "admin")
		) {
			console.log("not authorized!");
			res.status(403).send({
				message: "You are unauthorized to add tickets to this event!",
			});
		} else {
			console.log("You are authorized");
			await ticketToDelete.remove();

			res.status(200).send("Ticket deleted!");
		}
	} catch (err) {
		console.log(err);
		res.status(400).send(err.message);
	}
});

authRouter.post("/tickets", verifyToken, async (req, res) => {
	try {
		const event = await getEvent(req.body.eventId);
		const tickets = req.body.tickets;

		console.log(req.body.eventId, req.body.tickets);

		if (!(event.organizer == req.user._id || req.user.userRole == "admin")) {
			console.log("not authorized!");
			res.status(403).send({
				message: "You are unauthorized to add tickets to this event!",
			});
		} else {
			console.log("You are authorized");

			const addedTickets = await addEventTickets(event, tickets);

			// console.log(
			// 	addedTickets.map((ticket) => {
			// 		console.log("Ide gaaa");
			// 		console.log(Object.keys(ticket));
			// 		return { name: ticket.ticketName, price: ticket.ticketPrice };
			// 	})
			// );

			res.status(201).send("Tickets added!");
		}
	} catch (err) {
		console.log(err);
		res.status(400).send(err.message);
	}
});

authRouter.patch("/update", verifyToken, async (req, res) => {
	try {
		const event = req.body.event;
		const relatedEvent = await Event.findOne({ _id: event._id });
		delete event._id;

		if (
			!(relatedEvent.organizer == req.user._id || req.user.userRole == "admin")
		) {
			console.log("Not authorized!");
			res.status(403).send({
				message: "You are unauthorized to update this event!",
			});
		} else {
			console.log("You are authorized");

			relatedEvent.description = event.description;
			relatedEvent.endTime = event.endTime;
			relatedEvent.startTime = event.startTime;
			relatedEvent.eventType = event.eventType;
			relatedEvent.location = event.location;
			relatedEvent.name = event.name;

			await relatedEvent.save();

			res.status(200).send("Event updated!");
		}
	} catch (err) {
		console.log(err);
		res.status(400).send(err.message);
	}
});

authRouter.post(
	"/createwithpic",
	verifyToken,
	upload.single("cover_poster"),
	async (req, res) => {
		try {
			console.log(req.body);
			console.log(req.file);

			const event = await createEventWithPic(req);
			res.status(201).send(event.description);
		} catch (err) {
			console.log(err);
			res.status(400).send(err.message);
		}
	}
);

authRouter.post(
	"/poster",
	verifyToken,
	upload.single("cover_poster"),
	async (req, res) => {
		try {
			console.log(req.body);
			console.log(req.file);
			console.log(req.user);

			const { body, file, user } = req;
			const event = body._id;

			if (!event) {
				res.status(400).send("Event id not provided!");
			}

			const relatedEvent = await Event.findOne({ _id: event });

			if (
				!(
					relatedEvent.organizer == req.user._id || req.user.userRole == "admin"
				)
			) {
				console.log("not authorized!");
				res.status(403).send({
					message: "You are unauthorized to updathe this ticket!",
				});
			} else {
				const event = await editEventPic(req);
				res.status(200).send("Event picture updated!");
			}
		} catch (err) {
			console.log(err);
			res.status(400).send(err.message);
		}
	}
);

authRouter.get("/all", async (req, res) => {
	const events = await getAllEvents();
	const eventsWithPics = events.map((element) => {
		const { name, description, startTime, endTime, location, eventType, _id } =
			element;
		var returnElement = {
			name,
			description,
			startTime,
			endTime,
			location,
			eventType,
			_id,
		};
		returnElement.thumbnail = transformImageToSrc(element.thumbnail);

		return returnElement;
	});
	res.send({ events: eventsWithPics });
});

authRouter.get("/personal", verifyToken, async (req, res) => {
	const { _id } = req.user;
	const events = await getSearchedEvents({ organizer: _id });

	const personalEvents = events.map((element) => {
		const {
			name,
			description,
			startTime,
			endTime,
			location,
			eventType,
			_id,
			organizer,
		} = element;
		var returnElement = {
			name,
			description,
			startTime,
			endTime,
			location,
			eventType,
			_id,
			organizer,
		};
		returnElement.thumbnail = transformImageToSrc(element.thumbnail);

		return returnElement;
	});
	var passedEvents = [];
	var activeEvents = [];

	res.send({ events: personalEvents });
});

authRouter.post("/delete", verifyToken, async (req, res) => {
	const userId = req.user._id;
	const { _id, organizer } = req.body.event;

	const isOrganizerOrAdmin =
		req.user.userRole == "admin" || organizer == userId;
	// console.log(organizer == userId);
	// console.log(req.user.userRole == "admin");

	if (!isOrganizerOrAdmin) {
		res
			.status(403)
			.send({ message: "You are unauthorized to remove this event!" });
	} else {
		const eventToDelete = await Event.findOne({ _id }).populate("tickets");
		const tickets = eventToDelete.tickets;

		tickets.forEach((ticket) => {
			ticket.remove();
		});

		console.log(eventToDelete.name);
		console.log(eventToDelete.tickets);

		const event = await eventToDelete.remove();

		res.status(200).send({ message: eventToDelete.name + " deleted!" });
	}
});

authRouter.post("/search", async (req, res) => {
	console.log("Accessing ", req.path, "with ", req.body);
	const events = await getSearchedEvents(req.body);

	const searchedEventsWithPics = events.map((element) => {
		const {
			name,
			description,
			startTime,
			endTime,
			location,
			eventType,
			latlong,
			_id,
		} = element;
		var returnElement = {
			name,
			description,
			startTime,
			endTime,
			location,
			eventType,
			_id,
			latlong,
		};

		returnElement.thumbnail = transformImageToSrc(element.thumbnail);
		return returnElement;
	});

	res.send({ events: searchedEventsWithPics });
});

authRouter.get("/:id", async (req, res) => {
	try {
		const event = await getEvent(req.params.id);

		const {
			name,
			description,
			startTime,
			endTime,
			location,
			eventType,
			_id,
			tickets,
		} = event;

		var returnEventObject = {
			name,
			description,
			startTime,
			endTime,
			location,
			eventType,
			_id,
			tickets,
		};

		returnEventObject.img = transformImageToSrc(event.img);

		res.send(returnEventObject);
	} catch (err) {
		console.log(err.message);
		res.status(400).send(err.message);
	}
});

authRouter.post("/notify/:id", verifyToken, async (req, res) => {
	try {
		const event = await getEvent(req.params.id);
		const { title, notification } = req.body;

		console.log(title, notification);

		if (!(event.organizer == req.user._id || req.user.userRole == "admin")) {
			console.log("not authorized!");
			res.status(403).send({
				message: "You are unauthorized to add tickets to this event!",
			});
		} else {
			console.log("You are authorized");

			const ticketHolders = await PurchasedTicket.find({
				event: event._id,
			}).populate("user");

			const uniqueHolders = [];
			const uniqueMap = {};

			ticketHolders.forEach((holder) => {
				if (!uniqueMap[holder.user._id]) {
					uniqueMap[holder.user._id] = 1;
					uniqueHolders.push(holder);
				}
			});
			notifyAtendees(uniqueHolders, { title, notification });

			console.log("Jedinstvenih je", uniqueHolders.length);
			console.log("Sve skupa  je", ticketHolders.length);

			res.status(200).send("Attendes notified!");
		}
	} catch (err) {
		console.log(err);
		res.status(400).send(err.message);
	}
});

module.exports = authRouter;
