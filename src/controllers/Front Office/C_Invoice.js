const { GetInvoiceByResvRoomId, printInvoice, addNewInvoice, addNewInvoiceFromArticle, addNewInvoiceFromOrder } = require("../../models/Front Office/M_Invoice");
const { getBillingSummary, createResvPayment } = require("../../models/Front Office/M_ResvPayment");
const { error, success } = require("../../utils/response");

const getInvoice = async (req, res) => {
  const { reservationId, resvRoomId } = req.params;
  const { page = 1, perPage = 5, sort, search, date , artPage, artPerPage} = req.query;
  try {
    const invoices = await GetInvoiceByResvRoomId(parseInt(reservationId), parseInt(resvRoomId), sort, parseInt(page), parseInt(perPage), search, date, artPage, artPerPage);
    return success(res, `Showing Invoice from Reservation ${resvRoomId}`, invoices);
  } catch (err) {
    return error(res, err.message);
  }
};

const getSummary = async (req, res) => {
  const { reservationId, resvRoomId } = req.params;
  try {
    const billSummary = await getBillingSummary(parseInt(resvRoomId), parseInt(reservationId));
    return success(res, "Get Success", billSummary);
  } catch (err) {
    return error(res, err.message);
  }
};

const postNewPayment = async (req, res) => {
  const { reservationId = 1, resvRoomId = 1 } = req.query;
  const body = req.body;
  try {
    const paymentSummary = await createResvPayment(reservationId, resvRoomId, body)
    return success(res, `Payment Created Successfully, with spare changes of ${paymentSummary.changes}`, paymentSummary.resvPay)
  } catch (err) {
    return error(res, err.message)
  }
}

const postNewInvoice = async (req, res) => {
  const { reservationId = 1, resvRoomId = 1, identifier } = req.params;
  const body = req.body;
  try {
    const createdInvoice = identifier != "order" ? await addNewInvoiceFromArticle(body, parseInt(reservationId), parseInt(resvRoomId)) : await addNewInvoiceFromOrder(body.items, +reservationId, +resvRoomId, )
    return success(res, `New Invoice Created`, createdInvoice)
  } catch (err) {
    return error(res, err.message)
  }
}

const getPrintData = async (req, res) => {
  const { reservationId, resvRoomId } = req.params;
  const { page = 1, perPage = 5, sort, search, date } = req.query;
  try {
    const invoices = await printInvoice(parseInt(reservationId), parseInt(resvRoomId), sort, parseInt(page), parseInt(perPage), search, date);
    return success(res, "Operation Success", invoices);
  } catch (err) {
    return error(res, err.message);
  }
}

module.exports = { getInvoice, getSummary, postNewInvoice, getPrintData, postNewPayment };
