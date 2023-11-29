const { prisma } = require("../../../prisma/seeder/config");
const { getAllReservation, getReservationById, editReservation, CreateNewReservation, deleteReservationById } = require("../../models/Reservation/M_Reservation");
const { createNewResvRoom } = require("../../models/Reservation/M_ResvRoom");
const { success, error } = require("../../utils/response");

const getCorrection = async (req, res) => {
  let reservations, reservationDetail;
  const reservationId = req.query.id || "";
  const sortAndOrder = req.query.sortOrder || "";
  const displayOption = req.query.disOpt || "";
  const nameQuery = req.query.name || "";
  const dateQuery = req.query.date || "";
  // const page = +req.query.page || 2;
  // const limit = +req.query.limit || 5;
  // const skip = (page - 1) * limit;  
  // const resultCount = await prisma.reservation.count();
  // const totalPage = Math.ceil(resultCount / limit);


  reservations = await getAllReservation(sortAndOrder, displayOption, nameQuery, dateQuery);
  reservationDetail = reservationId != "" || undefined ? await getReservationById(parseInt(reservationId)) : "";
  return success(res, "Operation Success", {
    reservations,
    reservationDetail,
    // current_page: page - 0,
    // total_page: totalPage,
    // total_data: resultCount,
  });
};

const deleteReservation = async (req, res) => {
  const reservationId = +req.params.id
  try {
    const deletedReservation = await deleteReservationById(reservationId)
    return success(res, 'Operation Success', deletedReservation);
  } catch (err) {
    return error(res, err.message, 404)
  }
};

const postNewReservation = async (req, res) => {
  const body = req.body;
  try {
    const reservation = await CreateNewReservation(body);
    return success(res, 'Reservation Created', reservation);
  } catch (err) {
    return error(res, 'Unsuccess Create Reservation', 500, err);
  }
}

const postNewReservationRoom = async (req, res) => {
  const body = req.body;
  try {
    const resvRoom = await createNewResvRoom(body.arrangmentCode, body.reservationId, body)
    return success(res, `New Room Created in Room`, resvRoom);
  } catch (err) {
    return error(res, err.message, 404);
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

module.exports = { getCorrection, deleteReservation, postNewReservation, updateReservation, postNewReservationRoom };