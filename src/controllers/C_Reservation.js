const { getAllOrderFromReservationId } = require("../models/M_Bill");
const { getAllReservationComment } = require("../models/M_Comment");
const { getAllReservation } = require("../models/M_Reservation");

const getShowroom = async (req, res) => { 
    const reservationId = req.params.id;
    const orders = await getAllOrderFromReservationId(reservationId)
    res.status(200).json({ orders });
}

const getCorrection = async (req, res) => {
	const id = parseInt(req.params.id);
	const reservation = await getAllReservation(id);
	const comments = await getAllReservationComment();
	res.status(200).json({
		reservations: reservation,
		comments: comments,
	});
};

module.exports = { getShowroom, getCorrection };
