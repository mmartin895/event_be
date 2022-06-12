const { User } = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const checkIfUserExists = async (email) => {
	const user = await User.findOne({ email });
	return user;
};

const tokenSecret = "shushss";

const registerNewUser = async (user) => {
	const { name, lastName, email, passwd } = user;

	// const userRole = user.userRole ?? "user";
	const userRole = "user";


	if (await checkIfUserExists(email)) {
		throw new Error("User is already registered!");
	}

	const hashedPasswd = await bcrypt.hash(passwd, 10);
	const newUser = await new User({
		name,
		lastName,
		email,
		passwd: hashedPasswd,
		userRole,
	})
		.save()
		.then((user) => {
			console.log(user.name, " has registered!");
			return user;
		})
		.catch((err) => {
			throw new Error(err);
		});
	return newUser;
};

const logInUser = async (credentials) => {
	const { email, passwd } = credentials;

	const user = await checkIfUserExists(email);
	if (!user) {
		throw new Error("User isn't registered!");
	}
	const isValid = await bcrypt.compare(passwd, user.passwd);
	isValid ? console.log("good password") : console.log("bad password");

	if (!isValid) throw new Error("Incorrect email or password!");

	return user;
};

const generateJWT = async (user) => {
	const { name, email, userRole, _id } = user;

	var token = jwt.sign({ name, email, userRole, _id }, tokenSecret, {
		expiresIn: "24h",
	});
	console.log(token);
	return token;
};

module.exports = { registerNewUser, logInUser, generateJWT };
