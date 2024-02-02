const { Router } = require("express");
const { getArrivalGuestData, putChangeTreatment } = require("../controllers/Front Office/C_ArrivalGuest");
const { getFloorPlan, postStat, getFloorPLanDetail } = require("../controllers/Front Office/C_FloorPlan");
const { CreateLog, getFilterRoomAvail, getRoomAvailability } = require("../controllers/Front Office/C_RoomAvailability");
const { getAllReport, getReportPDF, postReportPDF } = require("../controllers/Front Office/C_Report");
const { getInvoice, getSummary, getInvoicePDF, postNewInvoice, getPrintData, postNewPayment, postInvoicePDF } = require("../controllers/Front Office/C_Invoice");
const { getHelperDetail, postHelperDetail, putNewReservationData, deleteReservation, getReportDetail, getInvoiceDetail, getPreviousCard, putNewInvoiceData, deleteInvoice } = require("../controllers/Front Office/C_Detail");
const { auth } = require("../middlewares/auth");

const R_FrontOffice = new Router();


//?DETAIL RESERVATION
R_FrontOffice.get("/detail/reservation/:reservationId/idcard", getPreviousCard);
R_FrontOffice.get("/detail/reservation/:reservationId/:resvRoomId/:action?", getHelperDetail);
R_FrontOffice.get("/detail/report/", getReportDetail);
R_FrontOffice.get("/detail/invoice/:reservationId/:resvRoomId", getInvoiceDetail);
R_FrontOffice.put("/detail/invoice/:reservationId/:resvRoomId", putNewInvoiceData)
R_FrontOffice.post("/detail/reservation/:reservationId/:resvRoomId/:action/:changeProgress?", postHelperDetail);
R_FrontOffice.put("/detail/reservation/:reservationId/:resvRoomId/edit", putNewReservationData);
R_FrontOffice.delete("/detail/invoice/:reservationId/:resvRoomId/delete", deleteInvoice);
R_FrontOffice.delete("/detail/reservation/:reservationId/:resvRoomId/delete", deleteReservation);

//?ARRIVAL GUEST LIST
R_FrontOffice.get("/arrival", auth(['Admin']),getArrivalGuestData);
R_FrontOffice.put("/arrival", putChangeTreatment);

//?FLOOR PLAN
R_FrontOffice.get("/floorplan", getFloorPlan);
R_FrontOffice.get("/floorplan/detail/:id?", getFloorPLanDetail)
R_FrontOffice.post("/floorplan/detail/:id/:status", auth(), postStat)

//?lOG AVAILABILITY
R_FrontOffice.get("/roomavail", getRoomAvailability);
R_FrontOffice.post("/roomavail/create-log", CreateLog);

//?REPORT PAGE
R_FrontOffice.get("/report/", getAllReport);

//?INVOICE
R_FrontOffice.get("/invoice/payment/:reservationId/:resvRoomId", getSummary);
R_FrontOffice.post("/invoice/payment/:reservationId/:resvRoomId", postNewPayment);
R_FrontOffice.get("/invoice/:reservationId/:resvRoomId", getInvoice);
R_FrontOffice.get("/invoice/:reservationId/:resvRoomId/print", getPrintData);
R_FrontOffice.post("/invoice/:reservationId/:resvRoomId/:identifier", postNewInvoice)

module.exports = R_FrontOffice;
