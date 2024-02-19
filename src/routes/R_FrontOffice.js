const { Router } = require("express");
const { getArrivalGuestData, putChangeTreatment } = require("../controllers/Front Office/C_ArrivalGuest");
const { getFloorPlan, postStat, getFloorPLanDetail } = require("../controllers/Front Office/C_FloorPlan");
const { CreateLog, getFilterRoomAvail, getRoomAvailability } = require("../controllers/Front Office/C_RoomAvailability");
const { getAllReport, getReportPDF, postReportPDF } = require("../controllers/Front Office/C_Report");
const { getInvoice, getSummary, getInvoicePDF, postNewInvoice, getPrintData, postNewPayment, postInvoicePDF } = require("../controllers/Front Office/C_Invoice");
const { getHelperDetail, postHelperDetail, putNewReservationData, deleteReservation, getReportDetail, getInvoiceDetail, getPreviousCard, putNewInvoiceData, deleteInvoice } = require("../controllers/Front Office/C_Detail");
const { auth } = require("../middlewares/auth");
const { getAllNotification, getUnreadMessage } = require("../controllers/C_Notification");

const R_FrontOffice = new Router();
const voucher = require('../controllers/Front Office/C_Voucher')

R_FrontOffice.use(auth(['showAdmin']))

//?DETAIL RESERVATION
R_FrontOffice.get("/detail/reservation/:reservationId/idcard", getPreviousCard);
R_FrontOffice.get("/detail/reservation/:reservationId/:resvRoomId/:action?", getHelperDetail);
R_FrontOffice.get("/detail/report/", getReportDetail);
R_FrontOffice.get("/detail/invoice/:reservationId/:resvRoomId", getInvoiceDetail);
R_FrontOffice.put("/detail/invoice/:reservationId/:resvRoomId", auth(['createAdmin']), putNewInvoiceData)
R_FrontOffice.post("/detail/reservation/:reservationId/:resvRoomId/:action/:changeProgress?", auth(['createAdmin']), postHelperDetail);
R_FrontOffice.put("/detail/reservation/:reservationId/:resvRoomId/edit", auth(['createAdmin']), putNewReservationData);
R_FrontOffice.delete("/detail/invoice/:reservationId/:resvRoomId/delete", auth(['createAdmin']), deleteInvoice);
R_FrontOffice.delete("/detail/reservation/:reservationId/:resvRoomId/delete", auth(['createAdmin']), deleteReservation);

//?ARRIVAL GUEST LIST
R_FrontOffice.get("/arrival", getArrivalGuestData);
R_FrontOffice.put("/arrival", auth(['createAdmin']), putChangeTreatment);

//?FLOOR PLAN
R_FrontOffice.get("/floorplan", getFloorPlan);
R_FrontOffice.get("/floorplan/detail/:id?", getFloorPLanDetail)
R_FrontOffice.post("/floorplan/detail/:id/:status", auth(['createAdmin']), postStat)

//?lOG AVAILABILITY
R_FrontOffice.get("/roomavail", getRoomAvailability);

//?REPORT PAGE
R_FrontOffice.get("/report/", getAllReport);

//?INVOICE
R_FrontOffice.get("/invoice/payment/:reservationId/:resvRoomId", getSummary);
R_FrontOffice.post("/invoice/payment/:reservationId/:resvRoomId", auth(['createAdmin']), postNewPayment);
R_FrontOffice.get("/invoice/:reservationId/:resvRoomId", getInvoice);
R_FrontOffice.get("/invoice/:reservationId/:resvRoomId/print", getPrintData);
R_FrontOffice.post("/invoice/:reservationId/:resvRoomId/:identifier", auth(['createAdmin']), postNewInvoice)

//?VOUCHER
R_FrontOffice.get("/voucher", voucher.getAll);
R_FrontOffice.get('/voucher/:id', voucher.getDetail)
R_FrontOffice.post('/voucher/:action?', auth(['createAdmin']), voucher.postAddEdit)
R_FrontOffice.delete('/voucher/:id', auth(['createAdmin']), voucher.deleteData)

module.exports = R_FrontOffice;
