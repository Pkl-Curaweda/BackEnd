// generatePDF.js
const PDFDocument = require('pdfkit-table');
const fs = require('fs');
// const { createTable } = require('pdfkit-table');

async function generatePDF() {
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream('hasil.pdf'));

    // Mulai menambahkan konten ke file PDF

    // Path ke file gambar yang akan ditambahkan
    const imagePath = 'src/image/lingian-logo-colored.png'; // Ubah path sesuai dengan lokasi gambar Anda

    // Mendapatkan informasi dari gambar
    const image = fs.readFileSync(imagePath);

    // Mendapatkan ukuran halaman PDF
    const pageWidth = doc.page.width;

    // Menghitung posisi untuk menempatkan gambar di tengah atas halaman PDF
    const x = (pageWidth - 100) / 2;
    const y = 20; // Jarak dari atas halaman

    // Menambahkan gambar ke halaman PDF di posisi yang telah dihitung
    // Letakkan gambar
    doc.image(image, x, y, { width: 100, height: 100 });

    // Pindahkan kursor ke posisi di bawah gambar
    doc.moveDown(5); // Pindahkan kursor ke bawah, secara default satu baris

    // Tambahkan teks di bawah gambar
    doc.fontSize(11).text('Bill Number: #XXXXXXXXXX', {
        align: 'left'
    });
    doc.moveDown();
    doc.fontSize(11).text('Reservation Resource: Individual Reservation', {
        align: 'left'
    });
    doc.moveUp(1);
    doc.fontSize(11).text('Guest Name: RONO RUSTAN, HENRY', {
        align: 'right'
    });
    doc.moveDown();
    // Menambahkan garis pembatas warna hijau
    doc.lineWidth(2) // Atur lebar garis menjadi 1 (sesuaikan dengan kebutuhan Anda)
        .moveTo(50, doc.y) // Mulai garis dari posisi x = 50, posisi y saat ini
        .lineTo(pageWidth - 50, doc.y) // Garis horizontal hingga ke ujung halaman dengan jarak 50 dari tepi
        .stroke("green");
    doc.moveDown();
    doc.fontSize(11).text('Arrival:             11/02/2023', {
        align: 'left'
    });
    doc.moveDown();
    doc.fontSize(11).text('Departure:       12/02/2023', {
        align: 'left'
    });
    doc.moveDown(2);

    const table = {
        width: 400,
        padding: 2,
        headers: [
        //   { label:"Date", property: 'date', width: 60, headerColor: 'darkgreen', fillColor: 'white' },
          { label:"Date", property:"date", valign: "center", headerAlign:"left", headerColor:"#3CB043", headerOpacity:1, color: "#FFFFFF" },
          { label:"Description", property:"description", valign: "center", headerAlign:"left", headerColor:"#3CB043", headerOpacity:1, color: "#FFFFFF" },
          { label:"Amount", property:"amount", valign: "center", headerAlign:"left", headerColor:"#3CB043", headerOpacity:1, color: "#FFFFFF" },  
        ],
        datas: [
          { 
            date: 'bold:12/02/23', 
            description: 'Room rate', 
            amount: '$1', 
          },
          { 
            date: '', 
            description: 'Room rate', 
            amount: '$1', 
          },
        ],
      };
    
      doc.table(table, {
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(11).fillColor("white"),
        prepareRow: (row, i) => doc.font("Helvetica").fontSize(11).fillColor("gray"),
      });

    // Menambahkan garis pembatas warna hijau
    doc.lineWidth(2) // Atur lebar garis menjadi 1 (sesuaikan dengan kebutuhan Anda)
        .moveTo(50, doc.y) // Mulai garis dari posisi x = 50, posisi y saat ini
        .lineTo(pageWidth - 50, doc.y) // Garis horizontal hingga ke ujung halaman dengan jarak 50 dari tepi
        .stroke("green");
    doc.moveDown(2);

    doc.fontSize(11).text('Gedung Lingian, Universitas Telkom, Jl.\ntelekomunikasi, No. 01, Terusan\nBuahBatu, Bandung, Jawa Barat 40257;\nPhone, +62 8112072999', {align: 'left'})
        .moveDown();

    doc.end();
}

generatePDF();
