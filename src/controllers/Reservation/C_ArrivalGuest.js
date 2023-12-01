const { prisma } = require("../../../prisma/seeder/config");
const { getAllReservation, getReservationById, editReservation, CreateNewReservation, deleteReservationById } = require("../../models/Reservation/M_Reservation");
const { createNewResvRoom } = require("../../models/Reservation/M_ResvRoom");
const { success, error } = require("../../utils/response");

const getCorrection = async (req, res) => {
  const resvRoomId = req.query.id || "";
  const sortAndOrder = req.query.sortOrder || "";
  const displayOption = req.query.disOpt || "";
  const nameQuery = req.query.name || "";
  const dateQuery = req.query.date || "";
  const page = +req.query.page;
  const perPage = +req.query.perPage;

  const { reservations, totalData } = await getAllReservation(sortAndOrder, displayOption, nameQuery, dateQuery, page, perPage);
  const reservationDetail = resvRoomId != "" || undefined ? await getReservationById(parseInt(resvRoomId)) : "";
  return success(res, "Operation Success", {
    reservations,
    reservationDetail,
    totalData
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

const postChangeRoom = async (req, res) => {
  const { resvRoomId, roomToId, note } = req.body;
  try {
    const resvRoom = await prisma.resvRoom.findUnique({
      where: { id: resvRoomId },
      include: { room: true, reservation: true },
    });

    const roomChange = await prisma.roomChange.create({
      data: {
        roomFrom: { connect: { id: resvRoom.roomId } },
        roomTo: { connect: { id: roomToId } },
        resvRoom: { connect: { id: resvRoomId } },
        note,
      },
    });

    const updatedResvRoom = await prisma.resvRoom.update({
      where: { id: resvRoomId },
      data: {
        roomId: roomToId,
      },
    });

    res.json({
      message: "Room change recorded successfully",
      roomChange,
      updatedResvRoom,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


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

module.exports = { getCorrection, deleteReservation, postNewReservation, updateReservation, postNewReservationRoom ,postChangeRoom};