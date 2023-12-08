const express = require("express");
const cookieParser = require("cookie-parser");
const R_Login = require("./routes/R_Login");
const R_Reservation = require("./routes/R_Reservation");
const cors = require('cors')

const app = express();
const port = process.env.PORT || 4000;

const origins = process.env.ALLOWED_ORIGINS || [];

app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: origins.split(','),
  credentials: true
}))

// app.get("*", checkUser)
app.use("/auth", R_Login);
app.use("/page", R_Reservation);

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
