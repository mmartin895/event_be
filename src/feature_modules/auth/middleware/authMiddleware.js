const jwt = require("jsonwebtoken");

const tokenSecret = "shushss";

const verifyToken = async (req, res, next) => {
	if (
		req.headers.authorization &&
		req.headers.authorization.split(" ").length > 1
	) {
		const token = req.headers.authorization.split(" ")[1];
		if (!token) {
			res.status(403).send("Token not provided");
		} else {
			jwt.verify(token, tokenSecret, (err, data) => {
				if (err) {
					res.status(403).send("Token expired");
				} else {
					req.user = data;
					// console.log(data);
					next();
				}
			});
		}
	} else {
		res.status(401).send("No authorization header");
	}
};

module.exports = { verifyToken };
