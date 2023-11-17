const {  Router } = require("express");
const { getCheckIn } = require("../controllers/Check In/C_CheckIn");
const { getCheckInId } = require("../controllers/Check In/C_CheckIn");
const { getAvail } = require("../controllers/Check In/C_avail");
const { getAvailRooms } = require("../controllers/Check In/C_availRoom");
const {getCancelledReservation} = require("../controllers/Check In/C_CancelledReservation");
const getReactiveReservation = require("../controllers/Check In/C_ReactiveReservation");
const {
  getAllGroupCheckIn,
} = require("../controllers/Check In/C_groupCheckIn");
const R_CheckIn = Router();

//?CHEKIN
R_CheckIn.get('/', getCheckIn);

//?CHEKIN BY ID
R_CheckIn.get('/:id', getCheckInId);

//?AVAIL
R_CheckIn.get("/avail", getAvail);

//?AVAIL ROOM
R_CheckIn.get("/availroom", getAvailRooms);

//?GROUP CHECK-IN
R_CheckIn.get("/group", getAllGroupCheckIn);

//?CANCELLED RESERVATION
R_CheckIn.get("/cancelled", getCancelledReservation);

//?REACTIVE RESERVATION
R_CheckIn.get('/reactive', getReactiveReservation);
module.exports = R_CheckIn;
