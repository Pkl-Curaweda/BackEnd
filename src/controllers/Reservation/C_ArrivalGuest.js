const { getAllReservation, getReservationById, editReservation, CreateNewReservation, deleteReservationById, createReservationHelper, getDetailById, DetailCreateReservationHelper, ChangeReservationProgress } = require("../../models/Front Office/M_Reservation");
const { createNewResvRoom } = require("../../models/Front Office/M_ResvRoom");
const { ChangeRoom } = require("../../models/House Keeping/M_RoomChange");
const { success, error } = require("../../utils/response");

const getArrivalGuest = (req, res) => {
  const { action } = req.params;
  switch (action){
    case "create":
      getCreateResevationHelper(req, res);
      break;
    case "edit":
      getEditReservationHelper(req, res);
      break;
    default:
      getArrivalGuestData(req, res);
      break;
  }
}

const getArrivalGuestData = async (req, res) => {
  try{
    const { reservationId, resvRoomId } = req.params;
    const { sortOrder = "", disOpt = "", name = "", date = "", page = 1, perPage = 5 } = req.query;
    const { reservations } = await getAllReservation(sortOrder, disOpt, name, date, parseInt(page), parseInt(perPage));
    const reservationDetail = resvRoomId != undefined ? await getDetailById(parseInt(resvRoomId), parseInt(reservationId)) : "";
    return success(res, "Operation Success", {
      reservations,
      reservationDetail,
    });
  }catch(err){
    return error(res, err.message)
  }
};

const getCreateResevationHelper = async (req, res) => {
  try {
    const helper = await DetailCreateReservationHelper();
    return success(res, 'Helper Running', helper)
  } catch (err) {
    return error(res, err.message)
  }
}

const getEditReservationHelper = async (req, res) => {
  try{
    const { reservationId, resvRoomId } = req.params;
     const helper = resvRoomId != undefined ? await getDetailById(parseInt(resvRoomId), parseInt(reservationId)) : "";
     return success(res, 'Helper Running', helper)
  }catch(err){
    return error(res, err.message)
  }
}

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
  const { reservationId } = req.params
  const body = req.body;
  try{
    const resvRoom = await createNewResvRoom(parseInt(reservationId), body)
    return success(res, `New Room  on Reservation ${reservationId}`, resvRoom);
  }catch(err){
    return error(res, err.message);
  }
}

const postChangeRoom = async (req, res) => {
  const { resvRoomId, reservationId } = req.params;
  const body = req.body
  try {
    const changeRoom = await ChangeRoom(parseInt(resvRoomId), parseInt(reservationId), body);
    return success(res, 'Changes Updated', changeRoom)
  } catch(err){
    return error(res, err.message)
  }
};

const postChangeProgress = async (req, res) => {
  const { reservationId, changeProgress } = req.params
  try{
    const changedProgress = await ChangeReservationProgress(parseInt(reservationId), changeProgress);
    return success(res, 'Change Success', changedProgress)
  }catch(err){
    return error(res, err.message)
  }
}

const putNewReservationData = async (req, res) => {
  const { reservationId, resvRoomId } = req.params
  const body = req.body;
  try {
    const updatedReservation = await editReservation(parseInt(reservationId), parseInt(resvRoomId), body);
    return success(res, `Reservation ${reservationId} Updated`, updatedReservation)
  } catch (err) {
    return error(res, err.message)
  }
};

const deleteReservation = async (req, res) => {
  const { reservationId } = req.params
  try {
    const deletedReservation = await deleteReservationById(parseInt(reservationId))
    return success(res, 'Operation Success', deletedReservation);
  } catch (err) {
    return error(res, err.message, 404)
  }
};

module.exports = { getArrivalGuest, postChangeProgress , getCreateResevationHelper, deleteReservation, postNewReservation, putNewReservationData, postNewReservationRoom, postChangeRoom };