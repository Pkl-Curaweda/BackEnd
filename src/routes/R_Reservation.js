const { Router } = require("express");
const { getShowroom } = require("../controllers/C_Reservation");
const R_Reservation =  new Router();

R_Reservation.get("/showroom/:id", getShowroom);

module.exports = R_Reservation