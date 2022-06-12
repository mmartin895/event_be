const express = require("express");
const app = express();

app.get("/", function (req, res) {
	res.send("Hello how you been");
});

const fun = () => {
	console.log("radi li export");
};

module.exports = fun;

app.listen(4000);
