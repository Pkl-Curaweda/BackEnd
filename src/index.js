const express = require("express");
const R_Auth = require("./routes/R_Login");
const R_availRoom = require("./routes/R_availRoom");
const R_avail = require('./routes/R_avail');
const R_Reservation = require("./routes/R_Reservation");
const { requireAuth } = require("./middlewares/AuthMiddleware");
const cookieParser = require("cookie-parser");
const R_Correction = require("./routes/R_Correction");
const R_FloorPlan = require("./routes/R_FloorPlan.js");

const app = express();
const port = process.env.PORT || 4000;
app.use(cookieParser());

app.use(express.json());

app.use("/", R_Auth);
app.use("/avail-room", requireAuth, R_availRoom);
app.use("/avail", requireAuth, R_avail);
app.use("/reservation", requireAuth, R_Reservation);
app.use("/sorting", requireAuth, R_Correction);
app.use('/Floor-Plan', R_FloorPlan);



app.listen(port, () => {
	console.log(`Listening to port ${port}`);
});
