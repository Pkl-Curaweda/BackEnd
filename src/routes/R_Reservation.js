const { Router } = require("express");
const { postNewReservation, deleteReservation, postNewReservationRoom, postChangeRoom, getArrivalGuest, putNewReservationData, postChangeProgress, postNewIdCard } = require("../controllers/Reservation/C_ArrivalGuest");
const { getFloorPlan } = require("../controllers/Reservation/C_FloorPlan");
const { getLogAvailability, CreateLog, getFilterRoomAvail } = require("../controllers/Reservation/C_LogAvailabilty");
const { getAllReport } = require("../controllers/Reservation/C_Report");
const { getInvoice } = require("../controllers/Reservation/C_Invoice");

const R_Reservation = new Router();

//?ARRIVAL GUEST LIST
R_Reservation.get("/arrival/:reservationId?/:resvRoomId?/:action?", getArrivalGuest);
R_Reservation.put("/arrival/:reservationId/:resvRoomId/edit", putNewReservationData);
R_Reservation.post("/arrival/:reservationId/:resvRoomId/create", postNewReservation);
R_Reservation.post("/arrival/:reservationId/:resvRoomId/add-room", postNewReservationRoom);
R_Reservation.post("/arrival/:reservationId/:resvRoomId/add-idcard", postNewIdCard);
R_Reservation.post("/arrival/:reservationId/:resvRoomId/change-room", postChangeRoom);
R_Reservation.post("/arrival/:reservationId/:resvRoomId/change-progress/:changeProgress", postChangeProgress);
R_Reservation.delete("/arrival/:reservationId?/:resvRoomId?/delete", deleteReservation);

//?FLOOR PLAN
R_Reservation.get("/floorplan", getFloorPlan);

//?lOG AVAILABILITY
R_Reservation.get("/roomavail", getLogAvailability)
R_Reservation.get("/roomavail/create-log", CreateLog)
R_Reservation.get("/filter-roomAvail", getFilterRoomAvail)

//?REPORT PAGE
R_Reservation.get("/report", getAllReport);

//?INVOICE
R_Reservation.get("/invoice/:reservationId/:resvRoomId", getInvoice)

module.exports = R_Reservation;