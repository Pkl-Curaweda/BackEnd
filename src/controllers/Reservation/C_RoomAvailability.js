const { prisma } = require("../../../prisma/seeder/config");
const { getLogAvailabilityData, createNewLogAvailable, filterRoomAvailabiy } = require("../../models/Front Office/M_LogAvailability");
const { success, error } = require("../../utils/response");

const getRoomAvailability = async (req, res) => {
  const { filter } = req.params
  const { page = 1, perPage = 5, date = ""} = req.query;
  try {
    const logData = await getLogAvailabilityData(date, parseInt(page), parseInt(perPage), filter);
    return success(res, "Operation Success", logData);
  } catch (err) {
    return error(res, err.meesage)
  }
};

const CreateLog = async (req, res) => {
  try {
    const createdLog = await createNewLogAvailable();
    return success(res, 'Log Created', createdLog)
  } catch (err) {
    return error(res, err.message)
  }

}

//? FILTER - ROOM AVAILABILITY
const getFilterRoomAvail = async (req, res) => {
  const { roomType } = req.query;
  const { roomId } = req.query;
  const { bedSetup } = req.query;

  try {
    const avail = await filterRoomAvailabiy(roomType, roomId, bedSetup);

    if (avail.length == 0) {
      return res.status(404).json({ error: "Room Not Availabily" });
    }

    return res.json(avail);

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal Server Error" });
  }

}

module.exports = { getRoomAvailability, CreateLog, getFilterRoomAvail, };
