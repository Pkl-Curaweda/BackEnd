const { Router } = require("express");
const { getCorrection, postNewReservation } = require("../controllers/reservation/C_Correction");
const { deleteReservation } = require("../models/Reservation/M_Correction");
const { getShowroom } = require("../controllers/Reservation/C_ShowRoom");
const { getAllStatus, getAvailabilityRoom } = require("../models/Reservation/M_FloorPlan");

const R_Reservation = new Router();

//?CORRECTION
R_Reservation.get("/correction", getCorrection);

//?SHOWROOM REV
R_Reservation.get("/showroom/:id", getShowroom);

//?FLOOR PLAN
R_Reservation.get("/floorplan", getAllStatus);
R_Reservation.get("/floorplan/available", getAvailabilityRoom);

//? NON SPECIFIC ROUTE
R_Reservation.delete("/delete/:id", deleteReservation);
R_Reservation.post("/create", postNewReservation);

module.exports = R_Reservation;
