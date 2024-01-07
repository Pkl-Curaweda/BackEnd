//packages
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const morgan = require('morgan')
const cors = require('cors')

// routers
const R_Login = require("./routes/R_Login");
const R_FrontOffice = require("./routes/R_FrontOffice");
const R_HouseKeeping = require('./routes/R_HouseKeeping')
const R_InRoomService = require("./routes/R_InRoomService");

//port
const app = express();
const port = process.env.PORT || 3000;
const origins = process.env.ALLOWED_ORIGINS || [];

//middlewares
app.use(morgan('combined'))
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors({
  origin: origins.split(','),
  credentials: true
}))
app.use(bodyParser.urlencoded({
    extended: true,
  }),
);

//??Start Endpoints
// app.get("*", checkUser)
app.use("/auth", R_Login);
app.use("/fo", R_FrontOffice);
app.use('/hk', R_HouseKeeping)
app.use('/irs', R_InRoomService)
// app.use(middleware(['Admin', 'Super Admin']));

//error handler
app.use((err, req, res, next) => {
  console.log(err);
});

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
