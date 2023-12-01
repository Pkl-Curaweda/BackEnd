const { getReportData } = require("../../models/Reservation/M_Report");
const { success, error } = require("../../utils/response");

const getAllReport  = async (req, res) => {
    try {
      const data = await getReportData();
      return success(res, 'Operation Success', data)
    }catch(err) {
      return error(res, err.message, err.code)
    }
  };

module.exports = {
    getAllReport,
}