const {  Router } = require("express");
const { getAvail } = require("../controllers/Check In/C_avail");
const { getAvailRooms } = require("../controllers/Check In/C_availRoom");
const getCancelledReservation = require("../controllers/Check In/C_CancelledReservation");
const R_CheckIn = Router();

//?AVAIL
R_CheckIn.get('/avail', getAvail);

//?AVAIL ROOM
R_CheckIn.get('/availroom', getAvailRooms);

//?CANCELLED RESERVATION
R_CheckIn.get('/cancelled', getCancelledReservation);

module.exports = R_CheckIn;