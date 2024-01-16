const oooRoomRepository = require('../../models/House Keeping/M_OOORoom.js');
const { error, success } = require("../../utils/response.js");
const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const path = require("path");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

async function findAll(req, res) {
  try {
    const oooRoom = await oooRoomRepository.all(req.query)
    return success(res, 'Get All ooo room success', oooRoom)
  }
  catch {
    return error(res, 'Get all ooo room error')
  }
}

async function print(req, res) {
  try{
    const data = await oooRoomRepository.all(req.query)
    const doc = new PDFDocument({ font: 'src/pdf/Inter-Regular.ttf', size: [792.00, 612.00] });
    const stream = fs.createWriteStream("src/pdf/reportPdf.pdf");

    doc.pipe(stream);
    doc.registerFont('regular', 'src/pdf/Inter-Regular.ttf');
    doc.registerFont('bold', 'src/pdf/Roboto-Bold.ttf');

    doc.fontSize(9);
    const table = {
        headers: [
            { label: "Room No", property: "roomNo", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
            { label: "Reason", property: "reason", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
            { label: "From", property: "from", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
            { label: "Until", property: "until", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
            { label: "PIC", property: "pic", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
            { label: "Department", property: "department", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
            { label: "Room Type", property: "roomType", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" }
        ],
        datas: []
    };
    const extras = data.OOORoom
    extras.forEach(ext => {
        table.datas.push({
            options: { padding: 1 },
            ...ext
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
  }catch(err){
    return error(res, err.message)
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function create(req, res) {
  try {
    const oooRoom = await oooRoomRepository.createOooRoom(req.body)
    return success(res, 'Create ooo room success', oooRoom)
  }
  catch (e) {
    console.log(e)
    return error(res, 'Create ooo room failed')
  }
}

module.exports = { findAll, create, print }