const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const path = require("path");
const { error, success } = require("../../utils/response");
const { printInvoice } = require("../../models/Front Office/M_Invoice");

const getPDF = async (req, res) => {
  const { reservationId, resvRoomId } = req.params;
  try {
    const invoiceData = await printInvoice(parseInt(resvRoomId), parseInt(reservationId));
    const doc = new PDFDocument({ font: 'src/pdf/Inter-Regular.ttf', size: 'A4' });
    const stream = fs.createWriteStream("src/pdf/example.pdf");

    doc.pipe(stream);
    doc.registerFont('regular', 'src/pdf/Inter-Regular.ttf');
    doc.registerFont('bold', 'src/pdf/Lato-Bold.ttf');
    const pageWidth = doc.page.width;
    // const x = (pageWidth - 100) / 2;
    // const y = 20; // Jarak dari atas halaman

    // Mendapatkan informasi dari gambar
    // const image = fs.readFileSync("src/pdf/lingian-logo-colored.png");
    // Menghitung posisi untuk menempatkan gambar di tengah atas halaman PDF
    // const x = (pageWidth - 100) / 2;
    // const y = 20; // Jarak dari atas halaman

    // Path ke file gambar yang akan ditambahkan
    // const imagePath = "../../image/lingian-logo-colored.png.png"; // Ubah path sesuai dengan lokasi gambar Anda

    // Mendapatkan informasi dari gambar
    // const image = fs.readFileSync(imagePath);

    // Mendapatkan ukuran halaman PDF


    // Menambahkan gambar ke halaman PDF di posisi yang telah dihitung
    // doc.image(image, x, y, { width: 100, height: 100 });

    // Pindahkan kursor ke posisi di bawah gambar
    // doc.image(image, x, y, { width: 100, height: 100 });
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
    doc.moveUp(1);

    doc.font('regular').text(`Guest Name: `, { //TODO: Need to change this one
      align: "right",
      continued: true
    })
      .font('bold').text(`${invoiceData.guestName}`, {
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
    doc.moveDown(2);

    let width = (pageWidth - 100) * 0.2
    const table = {
      headers: [
        { label: "Date", property: "date", valign: "center", headerAlign: "left", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF", width },
        { label: "Description", property: "desc", valign: "center", headerAlign: "left", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF", width: (pageWidth - 100 - (width * 2)) },
        { label: "Amount", property: "amount", valign: "center", headerAlign: "left", headerColor: "#3CB043", headerOpacity: 1, color: "#FFFFFF", width },
      ],
      datas: []
    };
    const invoices = invoiceData.invoices
    invoices.forEach(invoice => {
      table.datas.push({
        options: { padding: 2 },
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

module.exports = { getPDF };
