const { ThrowError } = require("../../models/Helpers/ThrowError");
const { getAllReservationComment } = require("../../models/M_Comment");
const { addReservation, getAllReservation, getReservationById, editReservation } = require("../../models/Reservation/M_Reservation");
const { success } = require("../../utils/response");

const getCorrection = async (req, res) => {
  let reservations, reservationDetail;
  const reservationId = req.query.id || "";
  const sortAndOrder = req.query.sortOrder || "";
  const nameQuery = req.query.name || "";
  const dateQuery = req.query.date || "";

  reservations = await getAllReservation(sortAndOrder, nameQuery, dateQuery);
  reservationDetail =  reservationId != "" || undefined ? await getReservationById(parseInt(reservationId)) : "";
  return success( res, 'Operation Success', {
    reservations,
    reservationDetail,
  })
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
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//? SEARCH
const searchName = async (req, res) => {
  const { name } = req.query;

  try {
  } catch (error) {
    console.error('Error searching reservations:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { getCorrection, deleteReservation, postNewReservation, updateReservation };