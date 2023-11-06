const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()) //Used to convert json data

app.listen(port, () => {
    console.log("Listening to port "+port);
})