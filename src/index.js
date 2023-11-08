const express = require("express");
const R_auth = require("./routes/R_Login");
const R_availRoom = require("./routes/R_availRoom");

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.use("/", R_auth);
app.use("/avail-room", R_availRoom);

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
