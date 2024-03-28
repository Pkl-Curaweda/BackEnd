//packages
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const https = require("https");
const http = require('http')

// routers
const R_Login = require("./src/routes/R_Login");
const R_FrontOffice = require("./src/routes/R_FrontOffice");
const R_HouseKeeping = require("./src/routes/R_HouseKeeping");
const R_InRoomService = require("./src/routes/R_InRoomService");
const R_SA = require("./src/routes/R_SuperAdmin");
const dashboard = require("./src/models/Front Office/M_Dashboard");
const R_Notif = require("./src/routes/R_Notification");
const R_IMPPS = require("./src/routes/R_IMPPS");

const { auth } = require("./src/middlewares/auth");
const { success, error } = require("./src/utils/response");
const { runSchedule } = require("./src/schedule/daily-schedule");

//port
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app)

const allowedOrigins = [
  // "https://ihms.curaweda.com", //Production
  "http://localhost:9000", //Development
];
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTION",
  credentials: true,
};


//middlewares
app.use(morgan("combined"));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cors(corsOptions));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 300,
    message: {
      message: "Too many request, please slow down",
    },
  })
);

//schedule
runSchedule()

//Socket
const LocalJson = require("./src/local");
const onlineTrackJsonPath = './src/local/onlineTracker.json'
const onlineTrackJson = new LocalJson(onlineTrackJsonPath)

const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:9000",
    credentials: true
  }
})

io.on('connection', async (socket) => {
  const name = socket.handshake.query.name
  onlineTrackJson.addEntry(name, true)

  io.emit('online', onlineTrackJson.readDataKey())
  socket.on('refreshTask', (data) => {
    io.emit('refreshTask', { message: 'Refresh mas' })
  })
  socket.on('notif', (data) => {
    io.emit('notif', { message: 'Refresh mas' })
  })
  socket.on('resv', () => {
    console.log('MENIGAS =================================')
    io.emit('resv', { message: 'Kami disini' })
  })

  socket.on('disconnect', (data) => {
    onlineTrackJson.deleteEntry(name)
    io.emit('online', onlineTrackJson.readDataKey())
    console.log('User outwawa')
  })

})

//??Expresss Start Endpoints
// app.get("*", checkUser)
app.get("/ping", (req, res) => {
  return res.json({ message: "Succesfully pinged" });
});
app.use("/notif", R_Notif);
app.use("/auth", R_Login);
app.get("/dashboard", auth(["showAdmin"]), async (req, res) => {
  let { page = 1, perPage = 5, date } = req.query;
  try {
    const dsbd = await dashboard.get(parseInt(page), parseInt(perPage), date);
    return success(res, "Get Success", dsbd);
  } catch (err) {
    return error(res, err.message);
  }
});
app.use("/sa", R_SA);
app.use("/fo", R_FrontOffice);
app.use("/hk", R_HouseKeeping);
app.use("/impps", R_IMPPS);
app.use("/irs", R_InRoomService);
// app.use(middleware(['Admin', 'Super Admin']));

// SSL configuration DISABLE ATAU BERI KOMEN JIKA DI LOCAL !
// const privateKey = fs.readFileSync("./certs/prmn.key", "utf8");
// const certificate = fs.readFileSync("./certs/prmn.crt", "utf8");
// const credentials = { key: privateKey, cert: certificate };
// const httpsServer = https.createServer(credentials, app);

// httpsServer.listen(port, () => {
//   console.log(`HTTPS Server running on port ${port}`);
// });

// DEVELOPMENT ONLY
server.listen(port, (err) => {
  console.log(`Listening to port ${port}`);
});

module.exports = io