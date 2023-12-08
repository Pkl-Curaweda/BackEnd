const { Router } = require("express");
const { getCorrection, postNewReservation, updateReservation, deleteReservation, postNewReservationRoom, postChangeRoom, getCreateResevationHelper, getArrivalGuest, putNewReservationData, postChangeProgress } = require("../controllers/Reservation/C_ArrivalGuest");
const { getFloorPlan } = require("../controllers/Reservation/C_FloorPlan");
const { getLogAvailability, CreateLog } = require("../controllers/Reservation/C_LogAvailabilty");
const { getAllReport, testing } = require("../controllers/Reservation/C_Report");

const R_Reservation = new Router();

//?ARRIVAL GUEST LIST
R_Reservation.get("/arrival/:reservationId?/:resvRoomId?/:action?", getArrivalGuest);
R_Reservation.put("/arrival/:reservationId/:resvRoomId/edit", putNewReservationData);
R_Reservation.post("/arrival/:reservationId/:resvRoomId/create", postNewReservation);
R_Reservation.post("/arrival/:reservationId/:resvRoomId/add-room", postNewReservationRoom);
R_Reservation.post("/arrival/:reservationId/:resvRoomId/change-room", postChangeRoom);
R_Reservation.post("/arrival/:reservationId/:resvRoomId/change-progress/:changeProgress", postChangeProgress);
R_Reservation.delete("/arrival/:reservationId?/:resvRoomId?/delete", deleteReservation);

//?FLOOR PLAN
R_Reservation.get("/floorplan", getFloorPlan);

//?lOG AVAILABILITY
R_Reservation.get("/roomavail", getLogAvailability)
R_Reservation.get("/roomavail/create-log", CreateLog)

//?REPORT PAGE
R_Reservation.get("/report", getAllReport);

module.exports = R_Reservation;
