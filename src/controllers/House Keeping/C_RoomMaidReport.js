const roomMaidRepository = require('../../models/House Keeping/M_RoomMaid.js')
const { error, success } = require('../../utils/response.js')
const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const path = require("path");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function findAll(req, res) {
  try {
    const data = await roomMaidRepository.getRoomMaidReport(req.query)
    return success(res, 'Get all room maid success', data)
  } catch {
    return error(res, 'Get all room maid failed')
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function findOne(req, res) {
  try {
    const data = await roomMaidRepository.get(req.params.id)
    return success(res, 'Get user success', data)
  } catch {
    return error(res, 'User not found', 404)
  }
}

async function print(req, res) {
  try {
    const data = await roomMaidRepository.getRoomMaidReport(req.query)
    const doc = new PDFDocument({ font: 'src/pdf/Inter-Regular.ttf', size: [792.00, 612.00] });
    const stream = fs.createWriteStream("src/pdf/reportPdf.pdf");

    doc.pipe(stream);
    doc.registerFont('regular', 'src/pdf/Inter-Regular.ttf');
    doc.registerFont('bold', 'src/pdf/Roboto-Bold.ttf');

    doc.fontSize(9);
    const table = {
      headers: [
        { label: "Room No", property: "roomNo", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
        { label: "Room Type", property: "roomType", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
        { label: "Room Status", property: "roomStatus", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
        { label: "PIC", property: "pic", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
        { label: "Guest Name", property: "guestName", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
        { label: "ResNo", property: "resNo", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
        { label: "Arrival", property: "arrival", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
        { label: "Departure", property: "departure", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
        { label: "Reservation Remarks", property: "remarks", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" }
      ],
      datas: []
    };
    const reports = data.report
    console.log(reports)
    reports.forEach(rpt => {
      table.datas.push({
        options: { padding: 1 },
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

// /**
//  * @param {import('express').Request} req
//  * @param {import('express').Response} res
//  */

// export async function create(req, res) {
//   try {
//     req.body.password = await bcrypt.hash(req.body.password, 10)
//     const user = await roomMaidRepository.create(req.body)
//     return success(res, 'Create user success', user)
//   } catch {
//     return error(res, 'Create user failed')
//   }
// }

module.exports = { findAll, findOne, print }