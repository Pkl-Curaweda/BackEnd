//packages
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const morgan = require('morgan')
const cors = require('cors')
const rateLimit = require('express-rate-limit');


// routers
const R_Login = require("./src/routes/R_Login");
const R_FrontOffice = require("./src/routes/R_FrontOffice");
const R_HouseKeeping = require('./src/routes/R_HouseKeeping')
const R_InRoomService = require("./src/routes/R_InRoomService");
const R_Notif = require("./src/routes/R_Notification");
const dashboard = require('./src/models/Front Office/M_Dashboard');
const { success, error } = require("./src/utils/response");
const R_IMPPS = require("./src/routes/R_IMPPS");
const { scheduleInvoiceReservation } = require("./src/schedule/daily-schedule");
const { auth } = require("./src/middlewares/auth");
const R_SA = require("./src/routes/R_SuperAdmin");
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
app.use(rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: {
    message: 'Too many request, please slow down'
  }
}));

// scheduleInvoiceReservation()

//??Start Endpoints
// app.get("*", checkUser)
app.get('/ping', (req, res) => {
  return res.json({message: "Succesfully pinged"})
})
app.use('/notif', R_Notif)
app.use("/auth", R_Login);
app.get('/dashboard', auth(['showAdmin']), async (req, res) => {
  let { page = 1, perPage = 5, date } = req.query
  try {
    const dsbd = await dashboard.get(parseInt(page), parseInt(perPage), date);
    return success(res, 'Get Success', dsbd)
  } catch (err) {
    return error(res, err.message)
  }
})
app.use('/sa', R_SA)
app.use("/fo", R_FrontOffice);
app.use('/hk', R_HouseKeeping)
app.use('/impps', R_IMPPS)
app.use('/irs', R_InRoomService)
// app.use(middleware(['Admin', 'Super Admin']));

//error handler
app.use((err, req, res, next) => {
  console.log(err);
});

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
