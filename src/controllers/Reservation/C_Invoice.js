const {
  GetInvoiceByResvRoomId,
  TestBalanceAndTotal,
} = require("../../models/Front Office/M_Invoice");
const {
  getBillingSummary,
} = require("../../models/Front Office/M_ResvPayment");
const { error, success } = require("../../utils/response");

const getInvoice = async (req, res) => {
  const { reservationId, resvRoomId } = req.params;
  const { page = 1, perPage = 5, sort } = req.query;
  try {
    const invoices = await GetInvoiceByResvRoomId(
      parseInt(reservationId),
      parseInt(resvRoomId),
      sort,
      parseInt(page),
      parseInt(perPage)
    );
    return success(res, "Operation Success", invoices);
  } catch (err) {
    return error(res, err.message);
  }
};

const getSummary = async (req, res) => {
  const { reservationId, resvRoomId } = req.params;
  try {
    const billSummary = await getBillingSummary(
      parseInt(resvRoomId),
      parseInt(reservationId)
    );
    return success(res, "Operation Success", billSummary);
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { getInvoice, getSummary };
