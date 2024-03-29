const { prisma } = require("../../../prisma/seeder/config.js");
const { GetInvoiceDetailByArt, putInvoiceData, deleteInvoiceData } = require("../../models/Front Office/M_Invoice.js");
const { getReportDetailData } = require("../../models/Front Office/M_Report.js");
const { editReservation, CreateNewReservation, deleteReservationById, getDetailById, DetailCreateReservationHelper, ChangeReservationProgress, AddNewIdCard, GetPreviousIdCard, AddWaitingList, roomAvailableChecker, reverseCheckIn } = require("../../models/Front Office/M_Reservation.js");
const { createNewResvRoom } = require("../../models/Front Office/M_ResvRoom.js");
const { assignTask } = require("../../models/House Keeping/IMPPS/M_MaidTask.js");
const { ChangeRoom } = require("../../models/House Keeping/M_RoomChange.js");
const { success, error } = require("../../utils/response.js");

const getHelperDetail = (req, res) => {
  const { action } = req.params;
  switch (action) {
    case "create":
      getCreateResevationHelper(req, res);
      break;
    case "edit":
      getEditReservationHelper(req, res);
      break;
    case "reset-checkin":
      getReverseCheckIn(req, res)
      break;
    default:
      getDetailData(req, res);
      break;
  }
}

const postHelperDetail = (req, res) => {
  const { action } = req.params;
  switch (action) {
    case "create":
      postNewReservation(req, res)
      break;
    case "add-room":
      postNewReservationRoom(req, res)
      break;
    case "waiting-list":
      postWaitingList(req, res)
      break;
    case "add-idcard":
      postNewIdCard(req, res)
      break;
    case "change-room":
      postChangeRoom(req, res)
      break;
    case "change-progress":
      postChangeProgress(req, res)
      break;
    default:
      throw Error("No Action Running");
  }
}


//*   GET REQUEST
const getDetailData = async (req, res) => {
  const { reservationId, resvRoomId } = req.params
  try {
    const detail = await getDetailById(parseInt(resvRoomId), parseInt(reservationId))
    return success(res, `Detail Reservation | ${resvRoomId} Shown`, detail)
  } catch (err) {
    return error(res, err.message)
  }
}

const getCheckerRoom = async (req, res) => {
  try {
    await roomAvailableChecker(req.query)
    return success(res, 'Room Available')
  } catch (err) {
    return error(res, err.message)
  }
}

const getCreateResevationHelper = async (req, res) => {
  try {
    const detail = await DetailCreateReservationHelper();
    return success(res, 'Create New Reservation', detail)
  } catch (err) {
    return error(res, err.message)
  }
}

const getEditReservationHelper = async (req, res) => {
  try {
    const { reservationId, resvRoomId } = req.params;
    let detail = { reservation: undefined, data: undefined }
    detail.reservation = resvRoomId != undefined ? await getDetailById(parseInt(resvRoomId), parseInt(reservationId)) : "";
    detail.data = await DetailCreateReservationHelper();
    return success(res, `Edit Reservation | ${resvRoomId}`, detail)
  } catch (err) {
    return error(res, err.message)
  }
}

const getReportDetail = async (req, res) => {
  const { date = new Date().toISOString().split("T")[0], disOpt = "day" } = req.query
  try {
    const detail = await getReportDetailData(date, disOpt)
    return success(res, 'Get Success', detail)
  } catch (err) {
    return error(res, err.message)
  }
}

const getInvoiceDetail = async (req, res) => {
  const { reservationId, resvRoomId } = req.params;
  const { ids } = req.query;
  try {
    const detail = await GetInvoiceDetailByArt(parseInt(reservationId), parseInt(resvRoomId), +ids)
    return success(res, `Invoice | ${detail.detail.desc}`, detail)
  } catch (err) {
    return error(res, err.message)
  }
}

const getPreviousCard = async (req, res) => {
  const { reservationId } = req.params;
  try {
    const idCard = await GetPreviousIdCard(parseInt(reservationId))
    return success(res, 'Get Success', idCard)
  } catch (err) {
    return error(res, err.message)
  }
}

//*   POST REQUEST
const postNewReservation = async (req, res) => {
  const body = req.body;
  try {
    const reservation = await CreateNewReservation(body, req.user);
    const message = reservation.createdResvRoom.voucherMessage != undefined ? `${reservation.createdResvRoom.voucherMessage}, but Reservation Created Successfully` : `Created Successfully with Id ${reservation.createdReservation.id}`
    return success(res, message, reservation);
  } catch (err) {
    return error(res, err.message);
  }
}

const postNewReservationRoom = async (req, res) => {
  const { reservationId } = req.params
  const body = req.body;
  try {
    const resvRoom = await createNewResvRoom(parseInt(reservationId), body, req.user)
    const message = resvRoom.voucherMessage != undefined ? `${resvRoom.voucherMessage}, but Reservation Created Successfully` : `New Room  on Reservation ${reservationId}`
    return success(res, message, resvRoom);
  } catch (err) {
    return error(res, err.message);
  }
}

const postChangeRoom = async (req, res) => {
  const { resvRoomId, reservationId } = req.params;
  const body = req.body
  try {
    const changeRoom = await ChangeRoom(parseInt(resvRoomId), parseInt(reservationId), body);
    return success(res, `Changing Room ${resvRoomId} | From: ${changeRoom.changeRoomLog.roomFromId} To: ${changeRoom.changeRoomLog.roomToId} `, changeRoom)
  } catch (err) {
    return error(res, err.message)
  }
};

const getReverseCheckIn = async (req, res) => {
  const { resvRoomId, reservationId } = req.params;
  try {
    const data = await reverseCheckIn(reservationId)
    return success(res, 'Reservation back to Check In', data)
  } catch (err) {
    return error(res, err.message)
  }
}

const postWaitingList = async (req, res) => {
  const { reservationId, resvRoomId } = req.params
  const { request } = req.body
  try {
    const task = await AddWaitingList(reservationId, resvRoomId, request)
    return success(res, 'Request successfully received', task)
  } catch (err) {
    return error(res, err.message)
  }
}

const postChangeProgress = async (req, res) => {
  const { reservationId, changeProgress } = req.params, { force } = req.query
  try {
    const changedProgress = await ChangeReservationProgress(parseInt(reservationId), changeProgress, force);
    return success(res, changedProgress.message, changedProgress)
  } catch (err) {
    return error(res, err.message)
  }
}

const postNewIdCard = async (req, res) => {
  const { reservationId, resvRoomId } = req.params
  const body = req.body
  try {
    const data = { reservationId: parseInt(reservationId), resvRoomId: parseInt(resvRoomId), ...body }
    const IdCard = await AddNewIdCard(data);
    return success(res, `New Id Card Created on Reservation ${reservationId}`, IdCard)
  } catch (err) {
    return error(res, err.message)
  }
}


//*   PUT REQUEST 
const putNewReservationData = async (req, res) => {
  const { reservationId, resvRoomId } = req.params
  const body = req.body;
  try {
    const updatedReservation = await editReservation(parseInt(reservationId), parseInt(resvRoomId), body, req.user);
    return success(res, `Reservation ${reservationId} Successfully Updated`, updatedReservation)
  } catch (err) {
    return error(res, err.message)
  }
};

const putNewInvoiceData = async (req, res) => {
  const { reservationId, resvRoomId, date } = req.params;
  const { ids } = req.query;
  const [id, uniqueId] = ids.split('-');
  const body = req.body
  try {
    const updatedData = await putInvoiceData(parseInt(reservationId), parseInt(resvRoomId), { date, id: parseInt(id), uniqueId: parseInt(uniqueId) }, body)
    return success(res, '', updatedData)
  } catch (err) {
    return error(res, err.message)
  }
}


//*   DELETE REQUEST  
const deleteReservation = async (req, res) => {
  const { reservationId, resvRoomId } = req.params
  try {
    const message = await deleteReservationById(parseInt(reservationId), +resvRoomId)
    return success(res, message);
  } catch (err) {
    return error(res, err.message, 404)
  }
};

const deleteInvoice = async (req, res) => {
  const { reservationId, resvRoomId } = req.params
  const { ids } = req.query
  try {
    const deleted = await deleteInvoiceData(+reservationId, +resvRoomId, +ids)
    return success(res, 'Invoice Successfully Deleted', deleted)
  } catch (err) {
    return error(res, err.message)
  }
}


module.exports = {
  getHelperDetail,
  postHelperDetail,
  putNewReservationData,
  getReverseCheckIn,
  deleteReservation,
  getCheckerRoom,
  getReportDetail,
  getInvoiceDetail,
  getPreviousCard,
  putNewInvoiceData,
  deleteInvoice
}