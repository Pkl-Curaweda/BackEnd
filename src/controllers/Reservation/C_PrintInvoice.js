const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const { error, success } = require("../../utils/response");
const { printInvoice } = require("../../models/Front Office/M_Invoice");

const generatePDF = async () => {
  try {
    const invoice = await printInvoice();
    const doc = new PDFDocument();
    const stream = fs.createWriteStream("hasil.pdf");

    // Menambahkan event listener untuk mengetahui kapan penulisan selesai
    stream.on("finish", () => {
      // console.log("Invoice Data:", invoice); // Menampilkan data di konsol setelah penulisan selesai
    });

    doc.pipe(stream);

    // Path ke file gambar yang akan ditambahkan
      // const imagePath = "../../image/lingian-logo-colored.png.png"; // Ubah path sesuai dengan lokasi gambar Anda

    // Mendapatkan informasi dari gambar
      // const image = fs.readFileSync(imagePath);

    // Mendapatkan ukuran halaman PDF
    const pageWidth = doc.page.width;

    // Menghitung posisi untuk menempatkan gambar di tengah atas halaman PDF
    const x = (pageWidth - 100) / 2;
    const y = 20; // Jarak dari atas halaman

    // Menambahkan gambar ke halaman PDF di posisi yang telah dihitung
      // doc.image(image, x, y, { width: 100, height: 100 });

    // Pindahkan kursor ke posisi di bawah gambar
    doc.moveDown(5);

    // Tambahkan teks di bawah gambar
    doc.fontSize(11).text("Bill Number: #XXXXXXXXXX", {
      align: "left",
    });
    doc.moveDown();
    doc
      .fontSize(11)
      .text(`Reservation Resource:  ${invoice[0].resourceName}`, {
        align: "left",
      });
    doc.moveUp(1);
    doc.fontSize(11).text(`Guest Name: ${invoice[0].guestName}.`, {
      align: "right",
    });
    doc.moveDown();

    // Menambahkan garis pembatas warna hijau
    doc
      .lineWidth(2)
      .moveTo(50, doc.y)
      .lineTo(pageWidth - 50, doc.y)
      .stroke("green");
    doc.moveDown();
    doc.fontSize(11).text(`Arrival: ${invoice[0].arrivalDate}.`, {
      align: "left",
    });
    doc.moveDown();
    doc.fontSize(11).text(`Departure: ${invoice[0].departureDate}.`, {
      align: "left",
    });
    doc.moveDown(2);

    const table = {
      headers: [
        {
          label: "Date",
          property: "date",
          width: 140,
          renderer: null,
          headerColor: "#009944",
        },
        {
          label: "Description",
          property: "description",
          width: 200,
          renderer: null,
          headerColor: "#009944",
        },
        {
          label: "Amount",
          property: "amount",
          width: 140,
          renderer: null,
          headerColor: "#009944",
        },
      ],
      datas: [

      ],
    };
       invoice.forEach((invoice) => {
         invoice.records.forEach((record) => {
           table.datas.push({
             options: { columnColor: "#FFFFFF" },
             date: record.billDate,
             description: record.description,
             amount: `$${record.amount}`,
           });
         });
       });
    doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(11),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font("Helvetica").fontSize(11);
      },
    });

    // Menambahkan garis pembatas warna hijau
    doc
      .lineWidth(2)
      .moveTo(50, doc.y)
      .lineTo(pageWidth - 50, doc.y)
      .stroke("green");
    doc.moveDown(2);

    doc
      .fontSize(11)
      .text(
        "Gedung Lingian, Universitas Telkom, Jl.\ntelekomunikasi, No. 01, Terusan\nBuahBatu, Bandung, Jawa Barat 40257;\nPhone, +62 8112072999",
        { align: "left" }
      )
      .moveDown();

    doc.end();
  } catch (err) {
    // return error(res, err.message);
  }
};

generatePDF();

// const printInvoice = async (req, res) => {
//   try {
//   } catch (err) {
//     return error(res, err.message);
//   }
// };

module.exports = { generatePDF };
