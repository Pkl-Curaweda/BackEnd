const { prisma } = require("../../../prisma/seeder/config");
const dashboard = require("../../models/Front Office/M_Dashboard")
const { PrismaDisconnect, ThrowError } = require("../../utils/helper");
const { error, success } = require("../../utils/response");

const getDashboard = async (req, res) => {
    let { page = 1, perPage = 5, date } = req.query
    try {
        const dsbd = await dashboard.get(parseInt(page), parseInt(perPage), date);
        return success(res, 'Operation Success', dsbd)
    } catch (err) {
      return error(res, err.message)
    }
}

module.exports = { getDashboard }