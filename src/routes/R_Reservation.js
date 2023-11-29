const { Router } = require("express");
const { getCorrection, postNewReservation, updateReservation, deleteReservation, postNewReservationRoom, postChangeRoom } = require("../controllers/Reservation/C_ArrivalGuest");
const { getFloorPlan } = require("../controllers/Reservation/C_FloorPlan");
const { getLogAvailability } = require("../controllers/Reservation/C_LogAvailabilty");
const { getAllReport, testing } = require("../controllers/Reservation/C_Report");

const R_Reservation = new Router();

//?ARRIVAL GUEST LIST
R_Reservation.get("/arrival", getCorrection);
R_Reservation.post("/reservation/create", postNewReservation);
R_Reservation.post("/reservation/room/create", postNewReservationRoom);
R_Reservation.delete("/reservation/:id", deleteReservation);
R_Reservation.post("/reservation/change-room", postChangeRoom);


//?FLOOR PLAN
R_Reservation.get("/floorplan", getFloorPlan);

//?lOG AVAILABILITY
R_Reservation.get("/roomavail", getLogAvailability)

//? NON SPECIFIC ROUTE
R_Reservation.put("/edit/:id", updateReservation);

//?REPORT PAGE
R_Reservation.get("/report", getAllReport);
R_Reservation.get("/test", testing);

module.exports = R_Reservation;
