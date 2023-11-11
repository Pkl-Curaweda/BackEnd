const express = require("express");
const R_Auth = require("./routes/R_Login");
const R_availRoom = require("./routes/R_availRoom");
const R_avail = require("./routes/R_avail");
const R_Reservation = require("./routes/R_Reservation");
const { requireAuth } = require("./middlewares/AuthMiddleware");
const cookieParser = require("cookie-parser");
const R_FloorPlan = require("./routes/R_FloorPlan.js");
const R_CancelledReservation = require("./routes/R_CancelledReservation.js");

const app = express();
const port = process.env.PORT || 4000;
app.use(cookieParser());

app.use(express.json());

app.use("/", R_Auth);
app.use("/avail-room", R_availRoom);
app.use("/avail", requireAuth, R_avail);
app.use("/reservation", R_Reservation);
app.use("/Floor-Plan", R_FloorPlan);
app.use("/Cancelled-Reservation", R_CancelledReservation);

app.listen(port, () => {
	console.log(`Listening to port ${port}`);
});
