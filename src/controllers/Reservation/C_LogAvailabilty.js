const { prisma } = require("../../../prisma/seeder/config");
const { getLogAvailabilityData } = require("../../models/Reservation/M_LogAvailability");
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

module.exports = { getLogAvailability };
