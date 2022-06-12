const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: {
		required: true,
		type: String,
		unique: true,
	},
	name: {
		required: true,
		type: String,
	},
	lastName: {
		required: true,
		type: String,
	},
	passwd: {
		required: true,
		type: String,
	},
	userRole: {
		required: true,
		type: String,
		default: new String("client"),
	},
});

userSchema.virtual('events', {
    ref: 'Event',
    localField: '_id',
    foreignField: 'organizer'
})

const User = new mongoose.model("User", userSchema);

const initializeAdmin = async () => {
	const count = await User.count({})
		.then((count) => {
			return count;
		})
		.catch((err) => {
			console.log(err);
		});

	if (count === 0) {
		//const hashedPasswd = await bcrypt.hash("admin1234", 10);
		const admin = new User({
			email: "admin@admin.com",
			name: "AdminName",
			lastName: "AdminLastName",
			passwd: "$2b$10$g2LbCCfDIME4./vPy7zHm.naW51QV6OpNbzWGgrVlbm/nInR3NilC",
			userRole: new String("admin"),
		});

		admin.save().then((user) => {
			console.log(user, " je kreiran");
		});
	}
};

initializeAdmin();

module.exports = { User };
