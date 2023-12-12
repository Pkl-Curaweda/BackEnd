const { getReportData } = require("../../models/Front Office/M_Report");
const { success, error } = require("../../utils/response");

const getAllReport = async (req, res) => {
  try { 
    
    const { disOpt } = req.query
    const data = await getReportData(disOpt);
    return success(res, 'Operation Success', data)
  } catch (err) {
    return error(res, err.message)
  }
};

module.exports = {
  getAllReport,
}