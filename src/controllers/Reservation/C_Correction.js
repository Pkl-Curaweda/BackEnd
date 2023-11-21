const { ThrowError } = require("../../models/Helpers/ThrowError");
const { getAllReservationComment } = require("../../models/M_Comment");
const {addReservation, getAllReservation, getReservationById, editReservation } = require("../../models/Reservation/M_Correction");

const getCorrection = async (req, res) => {
  let reservations, comments, reservationDetail;
  const reservationId = req.query.id || "";
  const includeComment = req.query.incCom;
  const sort = req.query.sort|| "asc";
  const orderBy = req.query.or;


  comments =
    includeComment === "true" ? await getAllReservationComment() : "";
  reservations =
    reservationId != "" || undefined
      ? await getReservationById(parseInt(reservationId))
      : await getAllReservation(orderBy, sort);
  res.status(200).json({
    reservations,
    reservationDetail,
    comments,
  });
};

const deleteReservation = async (req, res) => {
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

const postNewReservation = async (req, res) => {
    const body = req.body;
    try {
        const reservation = await addReservation(body);
        res.status(201).json(reservation);
    } catch (err) {
        console.log(err);
        res.status(500).json(err.message)
    }
}

const updateReservation = async (req, res) => {
	const reservationId = parseInt(req.params.id);
	const updatedData = req.body;

	try {
		const updatedReservation = await editReservation(
			reservationId,
			updatedData
		);

		if (!updatedReservation) {
			return res.status(404).json({ error: "Reservation not found" });
		}

		res.status(200).json({
			message: "Reservation updated successfully",
			updatedReservation,
		});
	} catch (error) {
		console.error("Error updating reservation:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

module.exports = { getCorrection, deleteReservation, postNewReservation, updateReservation };