//packages
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const morgan = require('morgan')
const cors = require('cors')

// routers
const R_Login = require("./routes/R_Login");
const R_Reservation = require("./routes/R_Reservation");
const roomRouter = require('./routes/room.route');
const guestRouter = require('./routes/guest.route');
const authRouter = require('./routes/auth.route');
const servicesRouter = require('./routes/services.route');
const productReqRouter = require('./routes/productReq.route');
const profileRouter = require('./routes/profile.route');
const orderRouter = require('./routes/order.route');
const subTypeRouter = require('./routes/subType.route');
const route = require('./routes/route')
// configs
const config = require('./configs/general.config');

//port
const app = express();
const port = process.env.PORT || 3000;
const origins = process.env.ALLOWED_ORIGINS || [];

//middlewares
app.use('/public', express.static('public'))
app.use(morgan('combined'))
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
  origin: origins.split(','),
  credentials: true
}))
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

//endpoints
// app.get("*", checkUser)
app.use("/auth", R_Login);
app.use("/page", R_Reservation);
app.use('/auth', authRouter);
app.use('/order', orderRouter);
app.use('/hk', route)
// app.use(middleware(['Admin', 'Super Admin']));
app.use('/room', roomRouter);
app.use('/guest', guestRouter);
app.use('/productReq', productReqRouter);
app.use('/profile', profileRouter);
app.use('/subType', subTypeRouter);
app.use('/guest', guestRouter);
app.use('/services', servicesRouter);

//error handler
app.use((err, req, res, next) => {
  console.log(err);
});

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
