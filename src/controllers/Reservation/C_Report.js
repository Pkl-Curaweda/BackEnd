const { getReportData, } = require("../../models/Front Office/M_Report");
const { success, error } = require("../../utils/response");

const getAllReport = async (req, res) => {
  try {
    const { date, disOpt, page = 1, perPage = 5 , sort} = req.query;
    const data = await getReportData(parseInt(page), parseInt(perPage), disOpt, sort, date);

    return success(res, 'Operation Success', data);
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = {
  getAllReport,
}