const { getAllRoomChange } = require("../../models/House Keeping/M_RoomChange")
const { error, success } = require("../../utils/response")
const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const path = require("path");

const get = async (req, res) => {
    try {
        const roomChangeData = await getAllRoomChange(req.query)
        return success(res, 'Operation Success', roomChangeData)
    } catch (err) {
        return error(res, err.message)
    }
}

const print = async (req, res) => {
    try {
        const data = await getAllRoomChange(req.query);
        const doc = new PDFDocument({ font: 'src/pdf/Inter-Regular.ttf', size: [792.00, 612.00] });
        const stream = fs.createWriteStream("src/pdf/reportPdf.pdf");

        doc.pipe(stream);
        doc.registerFont('regular', 'src/pdf/Inter-Regular.ttf');
        doc.registerFont('bold', 'src/pdf/Roboto-Bold.ttf');

        doc.fontSize(9);
        const table = {
            headers: [
                { label: "Change Date", property: "changeDate", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
                { label: "Arrival", property: "arrival", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
                { label: "Departure", property: "departure", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
                { label: "Time", property: "time", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
                { label: "Room No", property: "roomNo", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
                { label: "Move To", property: "moveTo", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
                { label: "Reason", property: "reason", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
                { label: "Reservation Number", property: "resvNo", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
                { label: "Guest Name", property: "guestName", valign: "center", headerAlign: "center", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF" },
            ],
            datas: []
        };
        const rmChg = data.roomChangeData
        rmChg.forEach(rchg => {
            table.datas.push({
                options: { padding: 1 },
                ...rchg
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

module.exports = { get, print }