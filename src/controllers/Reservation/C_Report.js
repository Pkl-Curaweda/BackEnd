const { prisma } = require("../../../prisma/seeder/config");
const { findReportReservation, getReportData } = require("../../models/Report/M_Report");
const { success } = require("../../utils/response");

const getAllReport  = async (req, res) => {
    try {
      const data = await findReportReservation();
      res.status(200).json({
        data,
      });
    }catch(err) {
      console.log(err);
    }
  };

const testing = async (req, res) => {
    try {
        const data = await getReportData();
        return success(res, 'success', data);
      }catch(err) {
        console.log(err);
      }
}

module.exports = {
    getAllReport,
    testing,
}