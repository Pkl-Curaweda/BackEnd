const express = require("express");
const cookieParser = require("cookie-parser");
const R_Login = require("./routes/R_Login");
const R_Reservation = require("./routes/R_Reservation");

const app = express();
const port = process.env.PORT || 4000;
app.use(cookieParser());
app.use(express.json());

// app.get("*", checkUser)
app.use("/auth", R_Login);
app.use("/reservation", R_Reservation);

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
