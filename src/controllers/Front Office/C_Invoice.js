const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const path = require("path");
const { GetInvoiceByResvRoomId, printInvoice, findBillPayment } = require("../../models/Front Office/M_Invoice");
const { getBillingSummary } = require("../../models/Front Office/M_ResvPayment");
const { error, success } = require("../../utils/response");

const getInvoice = async (req, res) => {
  const { reservationId, resvRoomId } = req.params;
  const { page = 1, perPage = 5, sort, search } = req.query;
  try {
    const invoices = await GetInvoiceByResvRoomId(parseInt(reservationId), parseInt(resvRoomId), sort, parseInt(page), parseInt(perPage), search);
    return success(res, "Operation Success", invoices);
  } catch (err) {
    return error(res, err.message);
  }
};

const getSummary = async (req, res) => {
  const { reservationId, resvRoomId } = req.params;
  try {
    const billSummary = await getBillingSummary(parseInt(resvRoomId), parseInt(reservationId));
    return success(res, "Operation Success", billSummary);
  } catch (err) {
    return error(res, err.message);
  }
};

const getBillPayment = async (req, res) => {
  const { reservationId = 1, resvRoomId = 1 } = req.query;
  try {
    const invoiceData = await findBillPayment(parseInt(resvRoomId), parseInt(reservationId));

    return success(res, 'Operation Success', invoiceData);

  } catch (err) {
    return ThrowError(err);
  }
}

const getInvoicePDF = async (req, res) => {
  const { reservationId, resvRoomId } = req.params;
  try {
    const invoiceData = await printInvoice(parseInt(resvRoomId), parseInt(reservationId));
    const doc = new PDFDocument({ font: 'src/pdf/Inter-Regular.ttf', size: 'LEGAL', margin: { top: 30, bottom: 20, right: 50, left: 50 } });
    const stream = fs.createWriteStream("src/pdf/invoicePdf.pdf");

    doc.pipe(stream);
    doc.registerFont('regular', 'src/pdf/Inter-Regular.ttf');
    doc.registerFont('bold', 'src/pdf/Lato-Bold.ttf');
    const pageWidth = doc.page.width;

    doc.image("src/pdf/lingian-logo-colored.png", (pageWidth - 100) / 2, 20, { width: 100, height: 100 });
    doc.moveDown(5);
    doc.fontSize(11);
    doc.font('regular').text('Bill Number: ', {
      align: 'left',
      continued: true
    })
      .font('bold').text(`#${resvRoomId}-${reservationId}`)
    doc.moveDown(0.5);

    doc.font('regular').text('Reservation Resource: ', {
      align: 'left',
      continued: true
    })
      .font('bold').text(`${invoiceData.resourceName}`)
    doc.moveUp(2);

    doc.font('regular').text(`Guest Name: `, { //TODO: Need to change this one
      align: "right",
      continued: true
    }).moveDown(1)
    doc.font('bold').text(`${invoiceData.guestName}`, {
      align: 'right',
    })
    doc.moveDown();

    doc.lineWidth(1).moveTo(doc.x, doc.y).lineTo(pageWidth - doc.x, doc.y).stroke("green");
    doc.moveDown();

    doc.font('regular').text('Arrival: ', {
      align: 'left',
      continued: true
    })
      .font('bold').text(`${invoiceData.arrivalDate}`)
    doc.moveDown(0.5);

    doc.font('regular').text('Departure: ', {
      align: 'left',
      continued: true
    })
      .font('bold').text(`${invoiceData.departureDate}`)
    doc.moveDown(1);

    let width = (pageWidth - 100) * 0.2
    const table = {
      headers: [
        { label: "Date", property: "date", valign: "center", headerAlign: "left", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF", width },
        { label: "", property: "", width: 2 },
        { label: "Description", property: "desc", valign: "center", headerAlign: "left", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF", width: (pageWidth - width - 74) * 0.6 },
        { label: "", property: "", width: 2 },
        { label: "Amount", property: "amount", valign: "center", headerAlign: "left", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF", width },
      ],
      datas: []
    };
    let arrayColor = ['#ffffff', '#777777']
    let i = 0
    const invoices = invoiceData.invoices
    invoices.forEach((invoice, index) => {

      table.datas.push({
        options: { padding: 2, columnColor: arrayColor[index % arrayColor.length] },
        ...invoice
      });
    })

    doc.table(table, {
      padding: 5,
      prepareHeader: () => doc.font('bold').fillColor('white'),
      prepareRow: () => doc.font('regular').fillColor('black')
    });

    // Menambahkan garis pembatas warna hijau
    doc.lineWidth(1).moveTo(doc.x, doc.y).lineTo(pageWidth - doc.x, doc.y).stroke("green");
    doc.moveDown(1)
    doc.text("Gedung Lingian, Universitas Telkom, Jl.\ntelekomunikasi, No. 01, Terusan\nBuahBatu, Bandung, Jawa Barat 40257;\nPhone, +62 8112072999",
      { align: "left" }
    )
    doc.end();

    stream.on("finish", () => {
      res.download(path.resolve(stream.path))
    });
  } catch (err) {
    console.log(err)
    return error(res, err.message)
  }
};

module.exports = { getInvoice, getSummary, getBillPayment, getInvoicePDF };
