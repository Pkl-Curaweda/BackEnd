const { getAllBillFromReservationId } = require("../models/M_Bill");

const getShowroom = async (req, res) => { //Still not working because there's no data from orders table
    const reservationId = req.params.id;
    const bills = await getAllBillFromReservationId(reservationId);
    res.status(200).json({
        bills
    })
}

module.exports = { getShowroom }