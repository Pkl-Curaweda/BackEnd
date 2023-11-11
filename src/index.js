const express = require("express");
const R_Auth = require("./routes/R_Login");
const R_availRoom = require("./routes/R_availRoom");
const R_Reservation = require("./routes/R_Reservation");
const { requireAuth } = require("./middlewares/AuthMiddleware");
const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 4000;
app.use(cookieParser());

app.use(express.json());

app.use("/", R_Auth);
app.use("/avail-room", requireAuth, R_availRoom);
app.use("/reservation", R_Reservation);

app.listen(port, () => {
	console.log(`Listening to port ${port}`);
});
