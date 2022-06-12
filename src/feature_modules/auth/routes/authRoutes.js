const { Router } = require("express");
const express = require("express");
const { append } = require("express/lib/response");
const { verifyToken } = require("../middleware/authMiddleware");

const {
	registerNewUser,
	logInUser,
	generateJWT,
} = require("../services/authServices");

const authRouter = Router();

authRouter.post("/register", async (req, res) => {
	console.log(req.body);
	try {
		const user = await registerNewUser(req.body);
		const token = await generateJWT(user);

		const { _id, name, email, userRole } = user;
		res.status(200).send({
			token,
			user: {
				_id,
				name,
				email,
				userRole,
			},
		});
	} catch (err) {
		res.status(400).send({
			error: err.message,
		});
	}
});

authRouter.post("/login", async (req, res) => {
	try {
		const credentials = req.body;
		const user = await logInUser(credentials);
		const token = await generateJWT(user);

		const { _id, name, email, userRole } = user;

		res.status(200).send({
			token,
			user: {
				_id,
				name,
				email,
				userRole,
			},
		});
		console.log(req.body, " logged in!");
	} catch (err) {
		res.status(400).send({
			error: err.message,
		});
	}
});

authRouter.get("/protected", verifyToken, async (req, res) => {
	console.log(req.user);
	res.send(" ok is good");
});

module.exports = authRouter;
