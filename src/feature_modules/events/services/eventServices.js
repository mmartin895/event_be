const { Event } = require("../../models/Event");
const { TicketInstance } = require("../../models/TicketInstance");

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

	if (queryObject.startTime) {
		var startTime2 = queryObject.startTime;
		var endTime2 = queryObject.endTime;
		delete queryObject.startTime;
		delete queryObject.endTime;
		// console.log(startTime, endTime);
	}
	var events = await Event.find(
		queryObject,
		"name description startTime endTime location eventType thumbnail _id organizer" //thumbnail
	);

	if (false && startTime2) {
		events = events.filter((event) => {
			if (
				new Date(event.startTime).getTime() < new Date(startTime2).getTime() ||
				new Date(event.endTime).getTime() > new Date(endTime2).getTime()
			) {
				// console.log("false odsjecak");
				// console.log(
				// 	new Date(event.startTime).getTime() < new Date(startTime2).getTime()
				// );
				// console.log(new Date(event.startTime), new Date(startTime2));
				// console.log(new Date(event.startTime).toLocaleDateString());
				// console.log(new Date(startTime2).toLocaleDateString());

				// console.log(
				// 	new Date(event.endTime).getTime() > new Date(endTime2).getTime()
				// );

				return false;
			}
			// console.log("true odsjecak");
			// console.log(
			// 	new Date(event.startTime).getTime() < new Date(startTime2).getTime()
			// );
			// console.log(
			// 	new Date(event.endTime).getTime() > new Date(endTime2).getTime()
			// );
			return true;
		});
	}

	return events;
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
};
