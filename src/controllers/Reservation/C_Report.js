const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const path = require("path");
const { getReportData, } = require("../../models/Front Office/M_Report");
const { success, error } = require("../../utils/response");

const getAllReport = async (req, res) => {
  try {
    const { displayOption } = req.params
    const { date, page = 1, perPage = 5, sort } = req.query;
    const data = await getReportData(displayOption, parseInt(page), parseInt(perPage), sort, date);

    return success(res, 'Operation Success', data);
  } catch (err) {
    return error(res, err.message);
  }
};


const getReportPDF = async (req, res) => {
  const { displayOption } = req.params
  const { date, page = 1, perPage = 5, sort } = req.query;
  try {
    const data = await getReportData(displayOption, parseInt(page), parseInt(perPage), sort, date);
    const doc = new PDFDocument({ font: 'src/pdf/Inter-Regular.ttf', size: [792.00, 612.00], margin: { top: 30, bottom: 20, right: 50, left: 50 } });
    const stream = fs.createWriteStream("src/pdf/reportPdf.pdf");

    doc.pipe(stream);
    doc.registerFont('regular', 'src/pdf/Inter-Regular.ttf');
    doc.registerFont('bold', 'src/pdf/Lato-Bold.ttf');

    doc.fontSize(11);
    const table = {
      headers: [
        { label: "Date", property: "date", valign: "center", headerAlign: "left", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
        { label: "Room Available", property: "roomAvailable", valign: "center", headerAlign: "left", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
        { label: "Occupied", property: "occupied", valign: "center", headerAlign: "left", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
        { label: "Occ%", property: "occ", valign: "center", headerAlign: "left", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
        { label: "Room Revenue", property: "roomRevenue", valign: "center", headerAlign: "left", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
        { label: "Arr", property: "arr", valign: "center", headerAlign: "left", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
      ],
      datas: []
    };
    const reports = data.reports
    reports.forEach((rpt, index) => {
      table.datas.push({
        options: { padding: 2 },
        ...rpt
      });
    })

    doc.table(table, {
      padding: 5,
      prepareHeader: () => doc.font('bold').fillColor('white'),
      prepareRow: () => doc.font('regular').fillColor('black')
    });
    doc.end();

    stream.on("finish", () => {
      res.download(path.resolve(stream.path))
    });
  } catch (err) {
    return error(res, err.message)
  }
}


module.exports = {
  getAllReport, getReportPDF
}