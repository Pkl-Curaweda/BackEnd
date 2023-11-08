const express = require("express");
const R_Auth = require("./routes/R_Login");
const R_availRoom = require("./routes/R_availRoom");
const R_Reservation = require("./routes/R_Reservation");

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.use("/", R_Auth);
app.use("/avail-room", R_availRoom);
app.use("/reservation", R_Reservation)

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
