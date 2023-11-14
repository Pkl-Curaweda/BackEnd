const { Router } = require("express");
const { getAvail } = require("../controllers/Check In/C_avail");
const { getAvailRooms } = require("../controllers/Check In/C_availRoom");
const getCancelledReservation = require("../controllers/Check In/C_CancelledReservation");
const {
  getAllGroupCheckIn,
} = require("../controllers/Check In/C_groupCheckIn");
const R_CheckIn = Router();

//?CHEKIN

//?AVAIL
R_CheckIn.get("/avail", getAvail);

//?AVAIL ROOM
R_CheckIn.get("/availroom", getAvailRooms);

//?GROUP CHECK-IN
R_CheckIn.get("/group", getAllGroupCheckIn);

//?CANCELLED RESERVATION
R_CheckIn.get("/cancelled", getCancelledReservation);

module.exports = R_CheckIn;
