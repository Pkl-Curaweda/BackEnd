const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const path = require("path");
const { getReportData, } = require("../../models/Front Office/M_Report");
const { success, error } = require("../../utils/response");
const { report } = require("process");
const { formatCurrency } = require("../../utils/helper");

const getAllReport = async (req, res) => {
  try {
    let { disOpt, date, page = 1, perPage = 5, sort } = req.query;
    const data = await getReportData(disOpt, parseInt(page), parseInt(perPage), sort, date);

    return success(res, 'Get Success', data);
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = {
  getAllReport
}