const { prisma } = require("../../../prisma/seeder/config");
const { getLogAvailabilityData, createNewLogAvailable, filterRoomAvailabiy } = require("../../models/Front Office/M_LogAvailability");
const { success } = require("../../utils/response");

const getLogAvailability = async (req, res) => {
  const dateQuery = req.query.date || "";
  const page = +req.query.page || 1;
  const limit = +req.query.limit || 5;
  const skip = (page - 1) * limit;
  const { logData, totalData } = await getLogAvailabilityData(dateQuery, skip, limit);
  return success(res, "Operation Success", {
    logData,
    current_page: page,
    totalPage: totalData
  });
};

const CreateLog = async (req, res) => {
  try{
      const createdLog = await createNewLogAvailable();
      return success(res, 'Log Created', createdLog)
  }catch(err){
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

module.exports = { getLogAvailability, CreateLog, getFilterRoomAvail, };
