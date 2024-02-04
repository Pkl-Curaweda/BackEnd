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
const dashboard = require('./models/Front Office/M_Dashboard');
const { success, error } = require("./utils/response");
const { getAllNotification } = require("./controllers/Front Office/C_Notification");
const R_IMPPS = require("./routes/R_IMPPS");
const { scheduleInvoiceReservation } = require("./schedule/daily-schedule");
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

scheduleInvoiceReservation()

//??Start Endpoints
// app.get("*", checkUser)
app.use("/auth", R_Login);
app.get('/dashboard', async (req, res) => {
  let { page = 1, perPage = 5, date } = req.query
  try {
    const dsbd = await dashboard.get(parseInt(page), parseInt(perPage), date);
    return success(res, 'Get Success', dsbd)
  } catch (err) {
    return error(res, err.message)
  }
})
app.get('/notif', getAllNotification)
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
