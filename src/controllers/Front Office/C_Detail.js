const { GetInvoiceDetailByArt, putInvoiceData } = require("../../models/Front Office/M_Invoice.js");
const { getReportDetailData } = require("../../models/Front Office/M_Report.js");
const { editReservation, CreateNewReservation, deleteReservationById, getDetailById, DetailCreateReservationHelper, ChangeReservationProgress, AddNewIdCard, GetPreviousIdCard } = require("../../models/Front Office/M_Reservation.js");
const { createNewResvRoom } = require("../../models/Front Office/M_ResvRoom.js");
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
    return success(res, 'Operation Success', detail)
  } catch (err) {
    return error(res, err.message)
  }
}

const getCreateResevationHelper = async (req, res) => {
  try {
    const detail = await DetailCreateReservationHelper();
    return success(res, 'Helper Running', detail)
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
    return success(res, 'Helper Running', detail)
  } catch (err) {
    return error(res, err.message)
  }
}

const getReportDetail = async (req, res) => {
  const { date = new Date().toISOString().split("T")[0], disOpt = "day" } = req.query
  try {
    const detail = await getReportDetailData(date, disOpt)
    return success(res, 'Operation Success', detail)
  } catch (err) {
    return error(res, err.message)
  }
}

const getInvoiceDetail = async (req, res) => {
  const { reservationId, resvRoomId, date } = req.params;
  const { ids } = req.query;
  const id = parseInt(ids.split('-')[0]);
  const uniqueId = parseInt(ids.split('-')[1])
  try {
    const detail = await GetInvoiceDetailByArt(parseInt(reservationId), parseInt(resvRoomId), { date, id, uniqueId })
    return success(res, 'Operation Success', detail)
  } catch (err) {
    return error(res, err.message)
  }
}

const getPreviousCard = async (req, res) => {
  console.log(req.params)
  const { reservationId } = req.params;
  try {
    const idCard = await GetPreviousIdCard(parseInt(reservationId))
    return success(res, 'Operation Success', idCard)
  } catch (err) {
    return error(res, err.message)
  }
}

//*   POST REQUEST
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
  try {
    const resvRoom = await createNewResvRoom(parseInt(reservationId), body)
    return success(res, `New Room  on Reservation ${reservationId}`, resvRoom);
  } catch (err) {
    return error(res, err.message);
  }
}

const postChangeRoom = async (req, res) => {
  const { resvRoomId, reservationId } = req.params;
  const body = req.body
  try {
    const changeRoom = await ChangeRoom(parseInt(resvRoomId), parseInt(reservationId), body);
    return success(res, 'Changes Updated', changeRoom)
  } catch (err) {
    return error(res, err.message)
  }
};

const postChangeProgress = async (req, res) => {
  const { reservationId, changeProgress } = req.params
  try {
    const changedProgress = await ChangeReservationProgress(parseInt(reservationId), changeProgress);
    return success(res, 'Change Success', changedProgress)
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
    return success(res, `New Id Created on Reservation ${reservationId}`, IdCard)
  } catch (err) {
    return error(res, err.message)
  }
}


//*   PUT REQUEST 
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

const putNewInvoiceData = async (req, res) => {
  const { reservationId, resvRoomId, date } = req.params;
  const { ids } = req.query;
  const [id, uniqueId] = ids.split('-');
  console.log(id, uniqueId)
  const body = req.body
  try{
    const updatedData = await putInvoiceData(parseInt(reservationId), parseInt(resvRoomId), { date, id: parseInt(id), uniqueId: parseInt(uniqueId) }, body)
    return success(res, 'Update Success', updatedData)
  }catch(err){
    return error(res, err.message)
  }
}


//*   DELETE REQUEST  
const deleteReservation = async (req, res) => {
  const { reservationId } = req.params
  try {
    const deletedReservation = await deleteReservationById(parseInt(reservationId))
    return success(res, 'Operation Success', deletedReservation);
  } catch (err) {
    return error(res, err.message, 404)
  }
};


module.exports = {
  getHelperDetail,
  postHelperDetail,
  putNewReservationData,
  deleteReservation,
  getReportDetail,
  getInvoiceDetail,
  getPreviousCard,
  putNewInvoiceData
}