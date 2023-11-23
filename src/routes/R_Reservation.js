const { Router } = require("express");
const { getCorrection, postNewReservation, updateReservation } = require("../controllers/Reservation/C_ArrivalGuest");
const { deleteReservation } = require("../models/Reservation/M_Reservation");
const { getStatus, } = require("../controllers/Reservation/C_FloorPlan");
const { searchName } = require ("../controllers/Reservation/C_Correction")

const R_Reservation = new Router();

//?CORRECTION
R_Reservation.get("/arrival", getCorrection);
R_Reservation.post("/reservation/create", postNewReservation);
R_Reservation.get("/search-reservations", searchName);

//?FLOOR PLAN
R_Reservation.get("/floorplan", getStatus);

//? NON SPECIFIC ROUTE
R_Reservation.delete("/delete/:id", deleteReservation);
R_Reservation.put("/edit/:id", updateReservation);

module.exports = R_Reservation;
