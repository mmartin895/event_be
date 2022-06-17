const { Event } = require("../../models/Event");
const { TicketInstance } = require("../../models/TicketInstance");
const webpush = require("web-push");

const sharp = require("sharp");
const createEvent = async (body) => {
	console.log(body.event.cover_poster);
	const { name, eventType, location, description, startTime, endTime } =
		body.event;
	const newEvent = await new Event({
		...body.event,
	}).save();
	return newEvent;
};

const transformImageToSrc = (imageBuffer) => {
	const imagePrefix = "data:image/png;base64,";

	// const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
	// element.thumbnail = element.thumbnail.toString("base64");

	// let buf = Buffer.from(element.thumbnail);
	imageString = imageBuffer
		? imagePrefix + imageBuffer.toString("base64")
		: undefined;
	return imageString;
};

const addEventTickets = async (eventId, tickets) => {
	var addedTickets = tickets.map((ticket) => {
		ticket.event = eventId;
		return ticket;
	});
	return await TicketInstance.insertMany(addedTickets);
};

const createEventWithPic = async (request) => {
	const { body, file, user } = request;
	body.latlong = JSON.parse(body.latlong);
	// console.log("user je \n", user);
	if (file) {
		console.log("file posstoji");
		const thumbnail = await sharp(file.buffer)
			.resize({ width: 340, height: 170 })
			.png()
			.toBuffer();
		const fullPicture = await sharp(file.buffer).png().toBuffer();

		body.thumbnail = thumbnail;
		body.img = fullPicture;
	}

	const newEvent = await new Event({
		...body,
		organizer: user._id,
	}).save();

	await addEventTickets(newEvent._id, JSON.parse(body.ticketList));

	console.log(newEvent.name);
	return newEvent;
};

const editEventPic = async (request) => {
	const { body, file, user } = request;

	if (!file) {
		throw new Error("No picture included!");
	} else {
		console.log("Edit picture posstoji");

		const relatedEvent = await Event.findOne({ _id: body._id });
		const thumbnail = await sharp(file.buffer)
			.resize({ width: 340, height: 170 })
			.png()
			.toBuffer();
		const fullPicture = await sharp(file.buffer).png().toBuffer();

		relatedEvent.thumbnail = thumbnail;
		relatedEvent.img = fullPicture;

		await relatedEvent.save();
	}
	return;
};

const getAllEvents = async (request) => {
	console.log(" get all");
	const events = await Event.find(
		{},
		"name description startTime endTime location eventType thumbnail  _id" //
	);
	// await events.forEach(async (event) => {
	// 	if (new Date(event.startTime) > new Date(event.endTime)) {
	// 		var oldStart = event.startTime;
	// 		event.startTime = event.endTime;
	// 		event.endTime = oldStart;
	// 		console.log(event);
	// 		await event.save();
	// 	}
	// });
	return events;
};

const getEvent = async (event_id) => {
	console.log(event_id);

	// const event = await Event.findOne({ _id: event_id }).populate("tickets");
	const event = await Event.findOne({ _id: event_id }).populate("tickets");
	// .exec();

	// const tickets = await TicketInstance.find({ event: event_id });

	// const returnEvent = event;
	// returnEvent.tickets = tickets;

	// const cars = ["Saab", "Volvo", "BMW"];
	// console.log(tickets);

	return event;
};

const getSearchedEvents = async (searchObject) => {
	var queryObject = searchObject;

	var searchedName = null;

	if (queryObject.name) {
		searchedName = queryObject.name;
		delete queryObject.name;
	}

	if (queryObject.startTime) {
		var startTime2 = queryObject.startTime;
		var endTime2 = queryObject.endTime;
		delete queryObject.startTime;
		delete queryObject.endTime;
		// console.log(startTime, endTime);
	}
	var events = await Event.find(
		queryObject,
		"name description startTime endTime location eventType thumbnail _id latlong organizer" //thumbnail
	);

	if (searchedName) {
		const searchLowered = searchedName.toLowerCase();

		events = events.filter((event) => {
			return event.name.toLowerCase().includes(searchLowered);
		});
	}

	if (startTime2) {
		events = events.filter((event) => {
			if (
				new Date(event.startTime).getTime() < new Date(startTime2).getTime() ||
				new Date(event.endTime).getTime() > new Date(endTime2).getTime()
			) {
				return false;
			}

			return true;
		});
	}

	return events;
};

const notifyAtendees = async (attendes, message) => {
	const privateKey = "YecuWqWBw0ExqalJtuHGy5g31uDFUw3UEBMIe2_ywbI";
	const publicKey =
		"BP3mliomXHHuSTC3QOG4GEDxeFfAg__PBtHya2Hi5506OgQih8-Oc4DPgkaZDGP9aN73ak6Uydb1EtzAoJGYnYE";

	webpush.setGCMAPIKey(
		"AAAAru5IKoc:APA91bFqjgP_mKPiyOVVI655pEr_6fjvqYIOwIR9gzj8yuba5u-_9l4YjXsBsXQv0H3WEWmhlp5wEMH8cATsOKPR1vaUvFJsDdBaJz3c9Y0yvYI8TF3irU8iAh3VZYVme2Cus-KvxaNY"
	);
	webpush.setVapidDetails("mailto:example@gmail.com", publicKey, privateKey);

	console.log(message);

	attendes.forEach((attendee) => {
		console.log(attendee.user.pushSubscription);
		webpush
			.sendNotification(attendee.user.pushSubscription, JSON.stringify(message))
			.then((res) => console.log(res))
			.catch((err) => console.log(err));
	});

	return;
};

module.exports = {
	createEventWithPic,
	getAllEvents,
	createEvent,
	getEvent,
	transformImageToSrc,
	getSearchedEvents,
	addEventTickets,
	editEventPic,
	notifyAtendees,
};
