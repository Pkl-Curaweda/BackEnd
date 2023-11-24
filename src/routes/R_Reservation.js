const { Router } = require("express");
const { getCorrection, postNewReservation, updateReservation } = require("../controllers/Reservation/C_ArrivalGuest");
const { deleteReservation } = require("../models/Reservation/M_Reservation");
const { getFloorPlan } = require("../controllers/Reservation/C_FloorPlan");
const { getLogAvailability } = require("../controllers/Reservation/C_LogAvailabilty");

const R_Reservation = new Router();

//?CORRECTION
R_Reservation.get("/arrival", getCorrection);
R_Reservation.post("/reservation/create", postNewReservation);

//?FLOOR PLAN
R_Reservation.get("/floorplan", getFloorPlan);

//?lOG AVAILABILITY
R_Reservation.get("/logAvailability", getLogAvailability)

//? NON SPECIFIC ROUTE
R_Reservation.delete("/delete/:id", deleteReservation);
R_Reservation.put("/edit/:id", updateReservation);

module.exports = R_Reservation;
