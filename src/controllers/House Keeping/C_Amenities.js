const { prisma } = require("../../../prisma/seeder/config.js");
const { getAllExtraBedData } = require("../../models/House Keeping/M_Amenities.js");
const { error, success } = require('../../utils/response.js');
const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const path = require("path");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function findAll(req, res) {
  try{
    const data = await getAllExtraBedData(req.params.art, req.query)
    return success(res, 'Operation Success', data)
  }catch(err){
    return error(res, err.message)
  }
}

async function print(req, res){
  try{
    const data = await getAllExtraBedData(req.params.art, req.query)
    const doc = new PDFDocument({ font: 'src/pdf/Inter-Regular.ttf', size: [792.00, 612.00] });
    const stream = fs.createWriteStream("src/pdf/reportPdf.pdf");

    doc.pipe(stream);
    doc.registerFont('regular', 'src/pdf/Inter-Regular.ttf');
    doc.registerFont('bold', 'src/pdf/Roboto-Bold.ttf');

    doc.fontSize(9);
    const table = {
        headers: [
            { label: "Date", property: "date", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
            { label: "Room No", property: "roomNo", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
            { label: "Used", property: "used", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
            { label: "Remain", property: "remain", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" }
        ],
        datas: []
    };
    const extras = data.extra
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

//!UNUSE CODE

// /**
//  * @param {import('express').Request} req
//  * @param {import('express').Response} res
//  */
// async function findOne(req, res) {
//   try {
//     const extraBed = await prisma.extraBed.findUniqueOrThrow({
//       where: {
//         id: parseInt(req.params.id)
//       }
//     })

//     return success(res, 'Find one extrabed success', extraBed)

//   } catch {
//     return error(res, 'extrabed not found', 404)
//   }
// }

// /**
//  * @param {import('express').Request} req
//  * @param {import('express').Response} res
//  */
// async function create(req, res) {
//   try {
//     const extraBed = await prisma.extraBed.create({
//       data: req.body
//     })

//     return success(res, 'Create extrabed success', extraBed)

//   } catch {
//     return error(res, 'Create extrabed failed')
//   }
// }

// /**
//  * @param {import('express').Request} req
//  * @param {import('express').Response} res
//  */
// async function update(req, res) {
//   try {
//     const extraBed = await prisma.extraBed.update({
//       where: {
//         id: parseInt(req.params.id)
//       },
//       data: req.body
//     })

//     return success(res, 'Update extrabed success', extraBed)

//   } catch {
//     return error(res, 'Update extrabed failed')
//   }
// }

// /**
//  * @param {import('express').Request} req
//  * @param {import('express').Response} res
//  */
// async function remove(req, res) {
//   try {
//     await prisma.extraBed.delete({
//       where: {
//         id: parseInt(req.params.id)
//       }
//     })
//   } catch {
//     return error(res, 'extrabed not found', 404)
//   }

//   return success(res, 'Delete extrabed success')
// }

module.exports = { findAll, print }