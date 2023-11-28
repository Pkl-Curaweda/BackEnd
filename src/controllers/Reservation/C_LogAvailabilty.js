const { prisma } = require("../../../prisma/seeder/config");
const {getLogAvailabilityData} = require("../../models/Reservation/M_LogAvailability");
const { success } = require("../../utils/response");

const getLogAvailability = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;
  const resultCount = await prisma.logAvailability.count();
  const totalPage = Math.ceil(resultCount / limit);
  const logAvailability = await getLogAvailabilityData(skip, limit);
  return success(res, "Operation Success", {
    logAvailability,
    current_page: page - 0,
    total_page: totalPage,
    total_data: resultCount,
  });
};

module.exports = { getLogAvailability };
