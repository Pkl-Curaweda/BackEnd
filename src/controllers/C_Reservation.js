const { getAllBillFromReservationId } = require("../models/M_Bill");
const { getAllReservationComment } = require("../models/M_Comment");
const { getAllReservation } = require("../models/M_Reservation");

const getShowroom = async (req, res) => { 
    //Still not working because there's no data from orders table
    const reservationId = req.params.id;
    const bills = await getAllBillFromReservationId(reservationId);
    res.status(200).json({ bills });
}

const getCorrection = async (req, res) => {
    const reservation = await getAllReservation();
    const comments = await getAllReservationComment();
    res.status(200).json({
        reservations : reservation,
        comments: comments
    });
}

module.exports = { getShowroom, getCorrection }