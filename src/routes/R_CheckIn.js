const {  Router } = require("express");
const { getAvail } = require("../controllers/Check In/C_avail");
const { getAvailRooms } = require("../controllers/Check In/C_availRoom");
const {getCancelledReservation} = require("../controllers/Check In/C_CancelledReservation");
const getReactiveReservation = require("../controllers/Check In/C_ReactiveReservation");
const R_CheckIn = Router();

//?CHEKIN

//?AVAIL
R_CheckIn.get('/avail', getAvail);

//?AVAIL ROOM
R_CheckIn.get('/availroom', getAvailRooms);

//?CANCELLED RESERVATION
R_CheckIn.get('/cancelled', getCancelledReservation);

//?REACTIVE RESERVATION
R_CheckIn.get('/reactive', getReactiveReservation);
module.exports = R_CheckIn;