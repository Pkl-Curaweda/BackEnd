const { getReportData, getReportDataByDate } = require("../../models/Front Office/M_Report");
const { success, error } = require("../../utils/response");

const getAllReport = async (req, res) => {
  try {
    const data = await getReportData();
    return success(res, 'Operation Success', data)
  } catch (err) {
    return error(res, err.message)
  }
};

const getReportByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const data = await getReportDataByDate(date)
    return success(res, 'Operation Success', data)
  } catch (err) {
    return error(res, err.message)
  }
}

module.exports = {
  getAllReport,
  getReportByDate,
}