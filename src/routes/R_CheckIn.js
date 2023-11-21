const { Router } = require("express");
const { getFilterRoomAvail } = require("../controllers/Check In/C_availabiliy")
const R_Checkin = new Router();

//? ROOM AVAILABILY - FILTER
R_Checkin.get("/filter-availroom", getFilterRoomAvail);

module.exports = R_Checkin;