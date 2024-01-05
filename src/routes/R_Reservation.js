const { Router } = require("express");
const { getArrivalGuestData, putChangeTreatment} = require("../controllers/Reservation/C_ArrivalGuest");
const { getFloorPlan, postStat, getFloorPLanDetail } = require("../controllers/Reservation/C_FloorPlan");
const {CreateLog,getFilterRoomAvail,getRoomAvailability} = require("../controllers/Reservation/C_RoomAvailability");
const { getAllReport, getReportPDF } = require("../controllers/Reservation/C_Report");
const {getInvoice,testInvoice,getSummary, getBillPayment, getInvoicePDF} = require("../controllers/Reservation/C_Invoice");
const {getHelperDetail,postHelperDetail,putNewReservationData,deleteReservation,getReportDetail,getInvoiceDetail} = require("../controllers/Reservation/C_Detail");
const { getDashboard } = require("../controllers/Reservation/C_Dashboard");

const R_Reservation = new Router();

//?DASHBOARD
R_Reservation.get("/", getDashboard);

//?DETAIL RESERVATION
R_Reservation.get("/detail/reservation/:reservationId/:resvRoomId/:action?",getHelperDetail);
R_Reservation.get("/detail/report/:displayOption?", getReportDetail);
R_Reservation.get("/detail/invoice/:reservationId/:resvRoomId/:date",getInvoiceDetail);
R_Reservation.post("/detail/reservation/:reservationId/:resvRoomId/:action/:changeProgress?",postHelperDetail);
R_Reservation.put("/detail/reservation/:reservationId/:resvRoomId/edit",putNewReservationData);
R_Reservation.delete("/detail/reservation/:reservationId/:resvRoomId/delete",deleteReservation);

//?ARRIVAL GUEST LIST
R_Reservation.get("/arrival", getArrivalGuestData);
R_Reservation.put("/arrival", putChangeTreatment);

//?FLOOR PLAN
R_Reservation.get("/floorplan", getFloorPlan);
R_Reservation.get("/floorplan/detail/:id?", getFloorPLanDetail)
R_Reservation.post("/floorplan/detail/:id/:stId", postStat)

//?lOG AVAILABILITY
R_Reservation.get("/roomavail/:filter?", getRoomAvailability);
R_Reservation.post("/roomavail/create-log", CreateLog);
R_Reservation.get("/filter-roomAvail", getFilterRoomAvail);

//?REPORT PAGE
R_Reservation.get("/report/:displayOption?", getAllReport);
R_Reservation.get("/report/:displayOption/print", getReportPDF)

//?INVOICE
R_Reservation.get("/invoice/payment/:reservationId/:resvRoomId", getSummary);
R_Reservation.get("/invoice/:reservationId/:resvRoomId", getInvoice);
R_Reservation.get("/invoice/:reservationId/:resvRoomId/print", getInvoicePDF);
R_Reservation.get("/invoice", getBillPayment);

module.exports = R_Reservation;
