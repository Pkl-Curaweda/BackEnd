const { getAllReservationComment } = require("../../models/M_Comment");
const { addReservation, getAllReservation, getReservationById } = require("../../models/Reservation/M_Correction");

const getCorrection = async (req, res) => {
    let reservations, comments;
    const reservationId = req.query.id || "";
    const includeComment = req.query.incCom;
    console.log({
        reservationId,
        includeComment
    })

    comments = includeComment === "true" ? await getAllReservationComment() : "";
    reservations = reservationId != "" || undefined ? await getReservationById(parseInt(reservationId)) : await getAllReservation();
    res.status(200).json({
        reservations, comments
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

module.exports = { getCorrection, deleteReservation, postNewReservation };