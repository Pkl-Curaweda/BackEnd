const { getAllReservation, changeSpecialTreatment } = require("../../models/Front Office/M_Reservation");
const { success, error } = require("../../utils/response");

const getArrivalGuestData = async (req, res) => {
  try {
    const { sortOrder = "", disOpt = "", name = "", date = "", page = 1, perPage = 5, history } = req.query;
    const data = await getAllReservation(sortOrder, disOpt, name, date, parseInt(page), parseInt(perPage), history);
    return success(res, "Get Success", data);
  } catch (err) {
    return error(res, err.message)
  }
};

const putChangeTreatment = async (req, res) => {
  let { id } = req.query
  try{
    const reservationId = parseInt(id.split('-')[0])
    let treatmentId = parseInt(id.split('-')[1])
    if(treatmentId < 1) throw Error('No Treatment Matched')
    const assignedTreatment = await changeSpecialTreatment(reservationId, treatmentId)
    return success(res, `Reservation ${reservationId} has changed to ${assignedTreatment}`)
  }catch(err){
    return error(res, err.message)
  }
}

module.exports = { getArrivalGuestData, putChangeTreatment };