const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const path = require("path");
const { getReportData, } = require("../../models/Front Office/M_Report");
const { success, error } = require("../../utils/response");
const { report } = require("process");
const { formatCurrency } = require("../../utils/helper");

const getAllReport = async (req, res) => {
  try {
    let { disOpt ,date, page = 1, perPage = 5, sort } = req.query;
    const data = await getReportData(disOpt, parseInt(page), parseInt(perPage), sort, date);

    return success(res, 'Operation Success', data);
  } catch (err) {
    return error(res, err.message);
  }
};

const postReportPDF = async (req, res) => {
  let { disOpt ,date, page = 1, perPage = 5, sort } = req.query;
  try {
    const data = await getReportData(disOpt, parseInt(page), parseInt(perPage), sort, date);
    const doc = new PDFDocument({ font: 'src/pdf/Inter-Regular.ttf', size: [792.00, 612.00], margin: { top: 30, bottom: 20, right: 50, left: 50 } });
    const stream = fs.createWriteStream("src/pdf/reportPdf.pdf");

    doc.pipe(stream);
    doc.registerFont('regular', 'src/pdf/Inter-Regular.ttf');
    doc.registerFont('bold', 'src/pdf/Roboto-Bold.ttf');

    doc.fontSize(7);
    const table = {
      headers: [
        { label: "Date", property: "date", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
        { label: "Room Available", property: "roomAvailable", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
        { label: "Occupied", property: "occupied", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
        { label: "Occ%", property: "occ", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
        { label: "Room Revenue", property: "roomRevenue", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
        { label: "Arr", property: "arr", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
      ],
      datas: []
    };

    table.headers.push(
      { label:`${data.ident} Rm.Avail`, property: "a_roomAvailable", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
      { label:`${data.ident} RNO`, property: "a_rno", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
      { label:`${data.ident} Occ %`, property: "a_occ", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
      { label:`${data.ident} Rm.Revenue`, property: "a_roomRevenue", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
      { label:`${data.ident} Arr`, property: "a_arr", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
      { label: `Tax & Service`, property: "tax", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
    )
    const reports = data.reports
    for (let rpt of reports){
      table.datas.push({
        options: { padding: 2 },
        date: rpt.date,
        roomAvailable : rpt.roomAvailable,
        occupied: rpt.occupied,
        occ: `${rpt.occ}%`,
        roomRevenue: formatCurrency(rpt.roomRevenue),
        arr: formatCurrency(rpt.arr),
        a_roomAvailable: formatCurrency(rpt.added.rm_avail),
        a_rno: formatCurrency(rpt.added.rno),
        a_occ: `${rpt.added.occ}%`,
        a_roomRevenue: formatCurrency(rpt.added.rev),
        a_arr: formatCurrency(rpt.added.arr),
        tax: formatCurrency(rpt.taxService.taxed)
      });

    }
    doc.table(table, {
      padding: 2,
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
  getAllReport, postReportPDF
}