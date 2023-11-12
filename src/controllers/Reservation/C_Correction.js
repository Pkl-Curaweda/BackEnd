const { getAllReservation, addReservation } = require("../../models/Reservation/M_Correction");

const getCorrection = async (req, res) => {
    const id = parseInt(req.params.id);
    const comment = req.params.comment;

    const reservation = await getAllReservation();
    const comments = await getAllReservationComment();
    res.status(200).json({
        reservations: reservation,
        comments: comments,
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