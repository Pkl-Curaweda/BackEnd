const { Router } = require("express");
const { getArrivalGuestData } = require("../controllers/Reservation/C_ArrivalGuest");
const { getFloorPlan } = require("../controllers/Reservation/C_FloorPlan");
const { CreateLog, getFilterRoomAvail, getRoomAvailability } = require("../controllers/Reservation/C_RoomAvailability");
const { getAllReport } = require("../controllers/Reservation/C_Report");
const { getInvoice } = require("../controllers/Reservation/C_Invoice");
const { getHelperDetail, postHelperDetail, putNewReservationData, deleteReservation, getReportDetail } = require("../controllers/Reservation/C_Detail");
const { auth } = require("../middlewares/AuthMiddleware");

const R_Reservation = new Router();

//?DETAIL RESERVATION
R_Reservation.get("/detail/reservation/:reservationId/:resvRoomId/:action?", getHelperDetail);
R_Reservation.get("/detail/report/:displayOption?", getReportDetail);
R_Reservation.post("/detail/reservation/:reservationId/:resvRoomId/:action/:changeProgress?", postHelperDetail);
R_Reservation.put("/detail/reservation/:reservationId/:resvRoomId/edit", putNewReservationData);
R_Reservation.delete("/detail/reservation/:reservationId/:resvRoomId/delete", deleteReservation);

//?ARRIVAL GUEST LIST
R_Reservation.get("/arrival", getArrivalGuestData);

//?FLOOR PLAN
R_Reservation.get("/floorplan", getFloorPlan);

//?lOG AVAILABILITY
R_Reservation.get("/roomavail/:filter?", getRoomAvailability)
R_Reservation.post("/roomavail/create-log", CreateLog)
R_Reservation.get("/filter-roomAvail", getFilterRoomAvail)

//?REPORT PAGE
R_Reservation.get("/report", getAllReport);

//?INVOICE
R_Reservation.get("/invoice/:reservationId/:resvRoomId", getInvoice)

module.exports = R_Reservation;