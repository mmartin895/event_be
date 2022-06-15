const express = require("express");
const cors = require("cors");
require("dotenv").config();

require("./src/db_config");
const authRouter = require("./src/feature_modules/auth/index");
const eventRouter = require("./src/feature_modules/events/index");
const ticketingRouter = require("./src/feature_modules/ticketing/index");

require("./src/feature_modules/models/User");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/event", eventRouter);
app.use("/tickets", ticketingRouter);

app.get("/", function (req, res) {
	res.send("Hello how you been today");
});

// app.listen(process.env.PORT || 5000);
app.listen(5000);
