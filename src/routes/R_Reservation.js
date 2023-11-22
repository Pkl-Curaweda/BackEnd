const { Router } = require("express");
const {
  getCorrection,
  postNewReservation,
  updateReservation,
} = require("../controllers/Reservation/C_ArrivalGuest");
const { deleteReservation } = require("../models/Reservation/M_Reservation");
const { getStatus } = require("../controllers/Reservation/C_FloorPlan");
const { searchName } = require("../controllers/Reservation/C_Correction");
const { todayReservation } = require("../controllers/Reservation/C_ResToday");
const { inHouseGuest } = require("../controllers/Reservation/C_InHouseGuest");
const { arrivalToday } = require("../controllers/Reservation/C_ArrivalToday");
const { departToday } = require("../controllers/Reservation/C_DepartToday");

const R_Reservation = new Router();

//?CORRECTION
R_Reservation.get("/arrival", getCorrection);
R_Reservation.get("/search-reservations", searchName);

//?FLOOR PLAN
R_Reservation.get("/floorplan", getStatus);

//?RESERVATION TODAY
R_Reservation.get("/today", todayReservation);

//?IN-HOUSE GUEST
R_Reservation.get("/in-house", inHouseGuest);

//?ARRIVAL TODAY
R_Reservation.get("/arrival-today", arrivalToday);

//?DEPART TODAY
R_Reservation.get("/depart-today", departToday);

//? NON SPECIFIC ROUTE
R_Reservation.delete("/delete/:id", deleteReservation);
R_Reservation.post("/create", postNewReservation);
R_Reservation.put("/edit/:id", updateReservation);

module.exports = R_Reservation;
