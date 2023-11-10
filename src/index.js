const express = require("express");
const authRouter = require("./routes/R_Login");
const R_FloorPlan = require("./routes/R_FloorPlan.js");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()) //Used to convert json data

app.listen(port, () => {
    console.log("Listening to port "+port);
})

app.use('/', authRouter);
app.use('/Floor-Plan', R_FloorPlan);