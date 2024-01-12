const { Router } = require("express");
const { getArrivalGuestData, putChangeTreatment } = require("../controllers/Front Office/C_ArrivalGuest");
const { getFloorPlan, postStat, getFloorPLanDetail } = require("../controllers/Front Office/C_FloorPlan");
const { CreateLog, getFilterRoomAvail, getRoomAvailability } = require("../controllers/Front Office/C_RoomAvailability");
const { getAllReport, getReportPDF } = require("../controllers/Front Office/C_Report");
const { getInvoice, testInvoice, getSummary, getBillPayment, getInvoicePDF, postNewInvoice } = require("../controllers/Front Office/C_Invoice");
const { getHelperDetail, postHelperDetail, putNewReservationData, deleteReservation, getReportDetail, getInvoiceDetail, getPreviousCard } = require("../controllers/Front Office/C_Detail");

const R_FrontOffice = new Router();


//?DETAIL RESERVATION
R_FrontOffice.get("/detail/reservation/:reservationId/idcard", getPreviousCard);
R_FrontOffice.get("/detail/reservation/:reservationId/:resvRoomId/:action?", getHelperDetail);
R_FrontOffice.get("/detail/report/:displayOption?", getReportDetail);
R_FrontOffice.get("/detail/invoice/:reservationId/:resvRoomId/:date", getInvoiceDetail);
R_FrontOffice.post("/detail/reservation/:reservationId/:resvRoomId/:action/:changeProgress?", postHelperDetail);
R_FrontOffice.put("/detail/reservation/:reservationId/:resvRoomId/edit", putNewReservationData);
R_FrontOffice.delete("/detail/reservation/:reservationId/:resvRoomId/delete", deleteReservation);

//?ARRIVAL GUEST LIST
R_FrontOffice.get("/arrival", getArrivalGuestData);
R_FrontOffice.put("/arrival", putChangeTreatment);

//?FLOOR PLAN
R_FrontOffice.get("/floorplan", getFloorPlan);
R_FrontOffice.get("/floorplan/detail/:id?", getFloorPLanDetail)
R_FrontOffice.post("/floorplan/detail/:id/:stId", postStat)

//?lOG AVAILABILITY
R_FrontOffice.get("/roomavail/:filter?", getRoomAvailability);
R_FrontOffice.post("/roomavail/create-log", CreateLog);
R_FrontOffice.get("/filter-roomAvail", getFilterRoomAvail);

//?REPORT PAGE
R_FrontOffice.get("/report/:displayOption?", getAllReport);
R_FrontOffice.get("/report/:displayOption/print", getReportPDF)

//?INVOICE
R_FrontOffice.get("/invoice/payment/:reservationId/:resvRoomId", getSummary);
R_FrontOffice.get("/invoice/:reservationId/:resvRoomId", getInvoice);
R_FrontOffice.get("/invoice/:reservationId/:resvRoomId/print", getInvoicePDF);
R_FrontOffice.post("/invoice/:reservationId/:resvRoomId", postNewInvoice)
// R_FrontOffice.get("/invoice", getBillPayment);

module.exports = R_FrontOffice;
