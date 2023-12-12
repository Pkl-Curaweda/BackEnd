const { GetInvoiceByResvRoomId } = require("../../models/Front Office/M_Invoice");
const { error, success } = require("../../utils/response");

const getInvoice = async (req, res) => {
    const { reservationId, resvRoomId } = req.params
    try{
        const invoices = await GetInvoiceByResvRoomId(parseInt(reservationId), parseInt(resvRoomId));
        return success(res, 'Operation Success', invoices)
    }catch(err){
        return error(res, err.message)
    }
}

module.exports = { getInvoice }