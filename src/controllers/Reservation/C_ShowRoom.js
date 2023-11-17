const { getAllOrderFromReservationId } = require("../../models/Reservation/M_ResvRoom");

const getShowroom = async (req, res) => {
	const reservationId = req.params.id;
	const filter = req.params.filter || "day";
	const orders = await getAllOrderFromReservationId(reservationId, filter);
	res.status(200).json({ orders });
}


module.exports = { getShowroom };
