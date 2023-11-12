const express = require("express");
const { requireAuth } = require("./middlewares/AuthMiddleware");
const cookieParser = require("cookie-parser");
const R_Login = require("./routes/R_Login");
const R_Reservation = require("./routes/R_Reservation");
const R_CheckIn = require("./routes/R_CheckIn");

const app = express();
const port = process.env.PORT || 4000;
app.use(cookieParser());

app.use(express.json());

app.use("/", R_Reservation);
app.use("/login", R_Login);
app.use('/checkin', R_CheckIn);

app.listen(port, () => {
	console.log(`Listening to port ${port}`);
});
