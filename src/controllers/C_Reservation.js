const { getAllBillFromReservationId } = require("../models/M_Bill");
const { getAllReservationComment } = require("../models/M_Comment");
const { getAllReservation } = require("../models/M_Reservation");
const { deleteReservation } = require("../models/M_Reservation");

const getShowroom = async (req, res) => {
	//Still not working because there's no data from orders table
	const reservationId = req.params.id;
	const bills = await getAllBillFromReservationId(reservationId);
	res.status(200).json({ bills });
};

const getCorrection = async (req, res) => {
	const id = parseInt(req.params.id);
	const reservation = await getAllReservation(id);
	const comments = await getAllReservationComment();
	res.status(200).json({
		reservations: reservation,
		comments: comments,
	});
};

const deleteResv = async (req, res) => {
	const reservationId = parseInt(req.params.id);

	try {
		const deletedReservation = await deleteReservation(reservationId);

		if (!deletedReservation) {
			return res.status(404).json({ error: "Reservation not found" });
		}

		res.status(200).json({ message: "Reservation deleted successfully" });
	} catch (error) {
		console.error("Error deleting reservation:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

module.exports = { getShowroom, getCorrection, deleteResv };
