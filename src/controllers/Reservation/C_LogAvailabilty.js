const { prisma } = require("../../../prisma/seeder/config");
const { getLogAvailabilityData, createNewLogAvailable } = require("../../models/Front Office/M_LogAvailability");
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

module.exports = { getLogAvailability, CreateLog };
