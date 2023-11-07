const express = require("express");
const authRouter = require("./routes/R_Login");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()) //Used to convert json data

app.listen(port, () => {
    console.log("Listening to port "+port);
})

app.use('/', authRouter);