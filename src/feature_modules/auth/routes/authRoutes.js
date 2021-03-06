const { Router } = require("express");
const express = require("express");
const { append } = require("express/lib/response");
const { verifyToken } = require("../middleware/authMiddleware");
const webpush = require("web-push");

const {
	registerNewUser,
	logInUser,
	generateJWT,
} = require("../services/authServices");
const { User } = require("../../models/User");

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

authRouter.get("/pushnotification", async (req, res) => {
	console.log("/pushnotification");

	const privateKey = "YecuWqWBw0ExqalJtuHGy5g31uDFUw3UEBMIe2_ywbI";
	const publicKey =
		"BP3mliomXHHuSTC3QOG4GEDxeFfAg__PBtHya2Hi5506OgQih8-Oc4DPgkaZDGP9aN73ak6Uydb1EtzAoJGYnYE";

	webpush.setGCMAPIKey(
		"AAAAru5IKoc:APA91bFqjgP_mKPiyOVVI655pEr_6fjvqYIOwIR9gzj8yuba5u-_9l4YjXsBsXQv0H3WEWmhlp5wEMH8cATsOKPR1vaUvFJsDdBaJz3c9Y0yvYI8TF3irU8iAh3VZYVme2Cus-KvxaNY"
	);
	webpush.setVapidDetails("mailto:example@gmail.com", publicKey, privateKey);

	// umjesto XYZ... bi trebao pisati jako dugi hash kod
	// const pushSubscription = {
	// 	endpoint:
	// 		"https://fcm.googleapis.com/fcm/send/eKIbmTtlJBQ:APA91bEaorR3VylMeT6qZqK4sRAKDKQyyK89hsStRYSYZMBiaEBdIYKGyZMKoGzUdw-K1Hn1434Lr35XD_99RhCJOyT7FAsgKmTWK65ZgsM8Vjn8beRop-8-iT2oyi_6bqimn4JXtE6-",
	// 	expirationTime: null,
	// 	keys: {
	// 		p256dh:
	// 			"BMIWdQ1cWrE9-PzfaoMOoBcOzuWZ2ILOLquw8tm13_In3HKC6Tlx-KkvqcAw85ZlTIsLhOd-c0kTOB4OWMILsTo",
	// 		auth: "iuvk0f8j_GN9EH6F3CgqPw",
	// 	},
	// };

	const pushSubscription = {
		endpoint:
			"https://fcm.googleapis.com/fcm/send/dcFXuel4ndA:APA91bED09l-VQBhExPCGeNuvTH2ySDfOStUw1P9w7JMJTIEY7L1KhYCHfgky5ro4__M6tqlTox8JBdxKsNNKZTyx2wHh5Sj980AOLUlhmbwp9UuGpnAc4EIgDHJvz2nbu6ig1AvyC0r",
		expirationTime: null,
		keys: {
			p256dh:
				"BNCriDL-S0iMaReQdnNCetXecyE958clNrIdKdcToWBYYvp0uWD2P0eofBs01qy9bMDQutgrUl5k0BrsZMSpQos",
			auth: "aFXefy5xKG8OWDY85GL17A",
		},
	};

	webpush
		.sendNotification(
			pushSubscription,
			JSON.stringify({ title: "Filip", notification: "je gej" })
		)
		.then((resp) => {
			console.log(resp);
		})
		.catch((err) => {
			console.log(err);
		});

	res.end();
});

authRouter.post("/subcribe", verifyToken, async (req, res) => {
	try {
		console.log("Novi push sub za ", req.user.name);
		// console.log("=======\n");
		// console.log("=======\n");
		// console.log("=======\n");
		// console.log("=======\n");
		// console.log("=======\n");

		const subscription = req.body;

		// console.log("tu je subscription \n");
		// console.log(subscription);

		const subscribedUser = await User.findOne({ _id: req.user._id });

		subscribedUser.pushSubscription = subscription;
		await subscribedUser.save();

		// console.log("tu je korisnik2 \n");
		// console.log(subscribedUser);
		res.end();
	} catch (err) {
		console.log(err);
		res.status(400).send(err.message);
	}
});

module.exports = authRouter;
