import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Letter, LetterType } from '../types';

/**
 * Export Letters to Excel (.xlsx)
 */
export function exportLettersToExcel(letters: Letter[], filename = 'Arsip_Surat_Masuk_Keluar.xlsx') {
  const formattedData = letters.map((l, idx) => ({
    No: idx + 1,
    'Tipe Surat': l.type,
    'Nomor Surat': l.nomorSurat,
    'Perihal / Judul': l.perihal,
    Pengirim: l.pengirim,
    Penerima: l.penerima,
    'Tanggal Surat': l.tanggalSurat,
    'Tanggal Diterima / Kirim': l.tanggalDiterimaKirim,
    Kategori: l.kategori,
    'Sifat Urgensi': l.sifat,
    Status: l.status,
    'Catatan Disposisi': l.disposisiCatatan || '-',
    'Disposisi Kepada': l.disposisiKepada || '-',
    'Ringkasan Isi': l.ringkasan,
    'Lampiran File': l.fileAttachment ? l.fileAttachment.name : 'Tidak Ada',
    'Format Lampiran': l.fileAttachment ? l.fileAttachment.format.toUpperCase() : '-',
    'Waktu Catat': new Date(l.createdAt).toLocaleDateString('id-ID'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 }, // No
    { wch: 14 }, // Tipe
    { wch: 26 }, // Nomor Surat
    { wch: 32 }, // Perihal
    { wch: 24 }, // Pengirim
    { wch: 24 }, // Penerima
    { wch: 14 }, // Tgl Surat
    { wch: 16 }, // Tgl Terima/Kirim
    { wch: 18 }, // Kategori
    { wch: 12 }, // Sifat
    { wch: 14 }, // Status
    { wch: 28 }, // Disposisi
    { wch: 20 }, // Kepada
    { wch: 35 }, // Ringkasan
    { wch: 25 }, // Lampiran
    { wch: 14 }, // Format
    { wch: 14 }, // Waktu Catat
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Agenda Surat');
  XLSX.writeFile(workbook, filename);
}

/**
 * Export Letters to PDF
 */
export function exportLettersToPdf(
  letters: Letter[],
  filterType?: LetterType | 'Semua',
  filename = 'Buku_Agenda_Surat_Organisasi.pdf'
) {
  const doc = new jsPDF({ orientation: 'landscape' });
  const titleType = filterType && filterType !== 'Semua' ? filterType.toUpperCase() : 'SURAT MASUK & SURAT KELUAR';

  // Kop Surat & Header
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('AGENDA ARSIP RESMI ORGANISASI', 14, 16);

  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text(`BUKU REGISTER ${titleType}`, 14, 22);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  const printedAt = new Date().toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Waktu Cetak: ${printedAt} WIB | Total Berkas: ${letters.length} Dokumen Terdaftar`, 14, 28);

  const tableBody = letters.map((l, idx) => [
    idx + 1,
    l.type,
    l.nomorSurat,
    l.perihal,
    l.type === 'Surat Masuk' ? l.pengirim : l.penerima,
    l.tanggalSurat,
    l.kategori,
    l.sifat,
    l.status,
    l.fileAttachment ? l.fileAttachment.name : '-',
  ]);

  autoTable(doc, {
    startY: 33,
    head: [
      [
        'No',
        'Tipe',
        'Nomor Surat',
        'Perihal / Judul',
        'Asal / Tujuan',
        'Tanggal',
        'Kategori',
        'Sifat',
        'Status',
        'Lampiran',
      ],
    ],
    body: tableBody,
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  doc.save(filename);
}

/**
 * Export Letters to Word (.doc / HTML compatible format)
 * Opens cleanly in Microsoft Word and LibreOffice Writer
 */
export function exportLettersToWord(
  letters: Letter[],
  filterType?: LetterType | 'Semua',
  filename = 'Buku_Agenda_Surat.doc'
) {
  const titleType = filterType && filterType !== 'Semua' ? filterType : 'Surat Masuk & Surat Keluar';
  const printedDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const rowsHtml = letters
    .map(
      (l, idx) => `
    <tr>
      <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${idx + 1}</td>
      <td style="border: 1px solid #ccc; padding: 6px; font-weight: bold;">${l.type}</td>
      <td style="border: 1px solid #ccc; padding: 6px; font-family: monospace;">${l.nomorSurat}</td>
      <td style="border: 1px solid #ccc; padding: 6px;"><strong>${l.perihal}</strong><br/><small style="color: #666;">${l.ringkasan || '-'}</small></td>
      <td style="border: 1px solid #ccc; padding: 6px;">${l.type === 'Surat Masuk' ? `Dari: ${l.pengirim}` : `Kepada: ${l.penerima}`}</td>
      <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${l.tanggalSurat}</td>
      <td style="border: 1px solid #ccc; padding: 6px;">${l.kategori}</td>
      <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${l.sifat}</td>
      <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${l.status}</td>
      <td style="border: 1px solid #ccc; padding: 6px;">${l.disposisiCatatan || '-'}</td>
      <td style="border: 1px solid #ccc; padding: 6px;">${l.fileAttachment ? l.fileAttachment.name : '-'}</td>
    </tr>
  `
    )
    .join('');

  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Agenda ${titleType}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #1e293b; margin: 20px; }
        h1 { font-size: 16pt; color: #0f172a; margin-bottom: 4px; }
        h2 { font-size: 12pt; color: #2563eb; margin-top: 0; margin-bottom: 15px; }
        table { border-collapse: collapse; width: 100%; font-size: 9.5pt; }
        th { background-color: #1e293b; color: #ffffff; padding: 8px 6px; border: 1px solid #0f172a; text-align: left; }
      </style>
    </head>
    <body>
      <h1>AGENDA RESMI DOKUMEN & ARSIP ORGANISASI</h1>
      <h2>Buku Register ${titleType} — Tanggal Rekap: ${printedDate}</h2>
      <p style="font-size: 9pt; color: #64748b;">Dicetak secara otomatis oleh Sistem Administrasi Database Organisasi</p>
      <br/>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Tipe</th>
            <th>Nomor Surat</th>
            <th>Perihal</th>
            <th>Asal / Tujuan</th>
            <th>Tgl Surat</th>
            <th>Kategori</th>
            <th>Sifat</th>
            <th>Status</th>
            <th>Disposisi</th>
            <th>Lampiran</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <br/><br/>
      <table style="width: 100%; border: none;">
        <tr>
          <td style="width: 60%; border: none;"></td>
          <td style="width: 40%; border: none; text-align: center;">
            <p>Mengetahui,</p>
            <p><strong>Sekretariat & Arsip Organisasi</strong></p>
            <br/><br/><br/>
            <p><u>( Administrator Database )</u></p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordContent], {
    type: 'application/msword',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export Letters to JSON
 */
export function exportLettersToJson(letters: Letter[], filename = 'Arsip_Surat_Organisasi.json') {
  const jsonStr = JSON.stringify(letters, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export Letters Table to Image / JPG (.jpg)
 */
export function exportLettersToJpg(letters: Letter[], filename = 'Rekap_Arsip_Surat.jpg') {
  const canvas = document.createElement('canvas');
  const width = 1200;
  const rowHeight = 36;
  const headerHeight = 160;
  const footerHeight = 80;
  const totalRows = Math.min(letters.length, 60);
  const height = Math.max(400, headerHeight + totalRows * rowHeight + footerHeight + 40);

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Top header bar
  ctx.fillStyle = '#0f172a'; // slate-900
  ctx.fillRect(0, 0, width, 90);

  // Accent line
  ctx.fillStyle = '#2563eb'; // blue-600
  ctx.fillRect(0, 86, width, 4);

  // Header Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillText('AGENDA RESMI PERSURATAN ORGANISASI', 40, 42);

  ctx.font = '13px Arial, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(
    `REKAPITULASI DOKUMEN SURAT MASUK & KELUAR — ${new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`,
    40,
    70
  );

  // Subheader stats strip
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 90, width, 55);
  ctx.fillStyle = '#334155';
  ctx.font = '12px Arial, sans-serif';
  const masukCount = letters.filter((l) => l.type === 'Surat Masuk').length;
  const keluarCount = letters.filter((l) => l.type === 'Surat Keluar').length;
  ctx.fillText(
    `Total: ${letters.length} Dokumen  |  Surat Masuk: ${masukCount}  |  Surat Keluar: ${keluarCount}  |  Format Ekspor: Format Gambar Resmi (JPG)`,
    40,
    124
  );

  // Table Column definitions
  const cols = [
    { label: 'NO', x: 40 },
    { label: 'TIPE', x: 80 },
    { label: 'NOMOR SURAT', x: 170 },
    { label: 'TGL SURAT', x: 380 },
    { label: 'PENGIRIM', x: 480 },
    { label: 'PENERIMA', x: 670 },
    { label: 'PERIHAL', x: 860 },
    { label: 'STATUS', x: 1080 },
  ];

  // Table Header row
  let y = 175;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(30, y - 20, width - 60, 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px Arial, sans-serif';
  cols.forEach((col) => {
    ctx.fillText(col.label, col.x, y);
  });

  // Rows
  y += 24;
  ctx.font = '11px Arial, sans-serif';
  for (let i = 0; i < totalRows; i++) {
    const l = letters[i];
    if (i % 2 === 0) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(30, y - 18, width - 60, rowHeight);
    }
    // Bottom border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, y + rowHeight - 18);
    ctx.lineTo(width - 30, y + rowHeight - 18);
    ctx.stroke();

    // No
    ctx.fillStyle = '#64748b';
    ctx.fillText(String(i + 1), cols[0].x, y);

    // Tipe badge text
    ctx.fillStyle = l.type === 'Surat Masuk' ? '#059669' : '#2563eb';
    ctx.font = 'bold 10px Arial, sans-serif';
    ctx.fillText(l.type === 'Surat Masuk' ? 'MASUK' : 'KELUAR', cols[1].x, y);

    // Nomor
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px monospace';
    const noText = l.nomorSurat.length > 24 ? l.nomorSurat.substring(0, 22) + '..' : l.nomorSurat;
    ctx.fillText(noText, cols[2].x, y);

    // Tanggal
    ctx.font = '11px Arial, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(l.tanggalSurat, cols[3].x, y);

    // Pengirim
    const pengirimText = l.pengirim.length > 22 ? l.pengirim.substring(0, 20) + '..' : l.pengirim;
    ctx.fillText(pengirimText, cols[4].x, y);

    // Penerima
    const penerimaText = l.penerima.length > 22 ? l.penerima.substring(0, 20) + '..' : l.penerima;
    ctx.fillText(penerimaText, cols[5].x, y);

    // Perihal
    const perihalText = l.perihal.length > 26 ? l.perihal.substring(0, 24) + '..' : l.perihal;
    ctx.fillText(perihalText, cols[6].x, y);

    // Status
    ctx.fillStyle = '#334155';
    ctx.font = '10px Arial, sans-serif';
    ctx.fillText(l.status, cols[7].x, y);

    y += rowHeight;
  }

  // Footer note
  y += 24;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px Arial, sans-serif';
  ctx.fillText(
    `Dokumen resmi di-generate dari Sistem Registrasi & Arsip Persuratan Organisasi pada ${new Date().toLocaleString(
      'id-ID'
    )}`,
    40,
    y
  );

  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    'image/jpeg',
    0.95
  );
}

/**
 * Export Single Letter to Styled Official Image / JPG (.jpg)
 */
export function exportSingleLetterToJpg(letter: Letter, filename?: string) {
  const finalFilename =
    filename || `Arsip_${letter.nomorSurat.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;

  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 960;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // White Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Outer border
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Inner margin border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(26, 26, width - 52, height - 52);

  // Kop Header
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LEMBAR REGISTRASI ARSIP SURAT RESMI', width / 2, 70);

  ctx.font = '12px Arial, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('SISTEM INFORMASI ADMINISTRASI & ARSIP KEDINASAN ORGANISASI', width / 2, 92);

  // Divider line
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 110);
  ctx.lineTo(width - 50, 110);
  ctx.stroke();

  // Type badge
  ctx.textAlign = 'left';
  const isMasuk = letter.type === 'Surat Masuk';
  ctx.fillStyle = isMasuk ? '#ecfdf5' : '#eff6ff';
  ctx.fillRect(50, 130, 140, 32);
  ctx.strokeStyle = isMasuk ? '#a7f3d0' : '#bfdbfe';
  ctx.strokeRect(50, 130, 140, 32);

  ctx.fillStyle = isMasuk ? '#065f46' : '#1e40af';
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillText(letter.type.toUpperCase(), 66, 151);

  // Status badge
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(width - 190, 130, 140, 32);
  ctx.strokeStyle = '#cbd5e1';
  ctx.strokeRect(width - 190, 130, 140, 32);
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillText(`STATUS: ${letter.status.toUpperCase()}`, width - 180, 151);

  // Fields Table
  const fields = [
    { label: 'Nomor Surat', value: letter.nomorSurat, bold: true },
    { label: 'Tanggal Surat', value: letter.tanggalSurat },
    { label: isMasuk ? 'Tanggal Diterima' : 'Tanggal Dikirim', value: letter.tanggalDiterimaKirim },
    { label: 'Asal Pengirim', value: letter.pengirim, bold: true },
    { label: 'Ditujukan Kepada', value: letter.penerima, bold: true },
    { label: 'Kategori Berkas', value: letter.kategori },
    { label: 'Sifat Urgensi', value: letter.sifat },
    { label: 'Perihal / Judul', value: letter.perihal, bold: true },
  ];

  let curY = 195;
  fields.forEach((f, idx) => {
    // Zebra row
    if (idx % 2 === 0) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(50, curY - 16, width - 100, 28);
    }
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText(f.label, 60, curY);

    ctx.fillStyle = '#0f172a';
    ctx.font = f.bold ? 'bold 12px Arial, sans-serif' : '12px Arial, sans-serif';
    ctx.fillText(`:  ${f.value}`, 220, curY);

    curY += 30;
  });

  // Ringkasan Isi Box
  curY += 10;
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillText('RINGKASAN & DESKRIPSI ISI SURAT:', 50, curY);

  curY += 10;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(50, curY, width - 100, 80);
  ctx.strokeStyle = '#e2e8f0';
  ctx.strokeRect(50, curY, width - 100, 80);

  ctx.fillStyle = '#334155';
  ctx.font = '11px Arial, sans-serif';
  const ringkasanText = letter.ringkasan || 'Tidak ada catatan ringkasan khusus.';
  // Wrap text in 2-3 lines
  const words = ringkasanText.split(' ');
  let line = '';
  let lineY = curY + 24;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > width - 140 && n > 0) {
      ctx.fillText(line, 65, lineY);
      line = words[n] + ' ';
      lineY += 18;
      if (lineY > curY + 70) break;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 65, lineY);

  // Disposisi Box (if exists)
  curY += 100;
  if (letter.disposisiCatatan || letter.disposisiKepada) {
    ctx.fillStyle = '#fffbeb';
    ctx.fillRect(50, curY, width - 100, 75);
    ctx.strokeStyle = '#fde68a';
    ctx.strokeRect(50, curY, width - 100, 75);

    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.fillText('INSTRUKSI DISPOSISI PIMPINAN:', 65, curY + 22);

    ctx.fillStyle = '#78350f';
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText(letter.disposisiCatatan || 'Harap segera dipelajari dan ditindaklanjuti.', 65, curY + 42);

    if (letter.disposisiKepada) {
      ctx.font = 'bold 10px Arial, sans-serif';
      ctx.fillText(`Diteruskan Kepada: ${letter.disposisiKepada}`, 65, curY + 62);
    }
    curY += 95;
  } else {
    curY += 20;
  }

  // Official Stamp Box / Verification Footer
  ctx.fillStyle = '#0f172a';
  ctx.font = '10px Arial, sans-serif';
  ctx.fillText('Dicatat secara digital oleh:', 60, curY + 20);
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillText('Sekretariat & Arsip Persuratan Organisasi', 60, curY + 38);
  ctx.font = '10px Arial, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(`Waktu Registrasi: ${new Date(letter.createdAt).toLocaleString('id-ID')}`, 60, curY + 54);

  // Official Verification Stamp Mockup
  ctx.save();
  ctx.translate(width - 180, curY + 35);
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 2;
  ctx.strokeRect(-60, -30, 140, 56);
  ctx.fillStyle = '#2563eb';
  ctx.font = 'bold 10px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TERVERIFIKASI', 10, -10);
  ctx.font = '9px Arial, sans-serif';
  ctx.fillText('ARSIP RESMI DPP', 10, 6);
  ctx.fillText(new Date().toLocaleDateString('id-ID'), 10, 19);
  ctx.restore();

  // Bottom Notice
  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    'Dokumen ini merupakan salinan bukti registrasi elektronik sah dari Database Manajemen Persuratan.',
    width / 2,
    height - 36
  );

  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = finalFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    'image/jpeg',
    0.95
  );
}

/**
 * Download a sample Excel template for importing letters
 */
export function downloadLetterImportTemplate() {
  const sampleData = [
    {
      'Tipe Surat (Surat Masuk / Surat Keluar)': 'Surat Masuk',
      'Nomor Surat': '012/UND/KEMENPORA/IX/2026',
      'Perihal / Judul': 'Undangan Silaturahmi & Dialog Pemuda Nasional',
      Pengirim: 'Kementerian Pemuda dan Olahraga RI',
      Penerima: 'Ketua Umum DPP Organisasi',
      'Tanggal Surat (YYYY-MM-DD)': '2026-09-01',
      'Tanggal Diterima / Kirim (YYYY-MM-DD)': '2026-09-02',
      'Kategori (Undangan/Pemberitahuan/Permohonan/SK/Laporan/MoU/Lainnya)': 'Undangan',
      'Sifat (Biasa/Penting/Segera/Rahasia)': 'Penting',
      'Status (Diterima/Diproses/Disposisi/Selesai/Terkirim/Diarsipkan)': 'Diterima',
      'Catatan Disposisi': 'Dihadiri oleh Bidang Hubungan Luar Negeri',
      'Ringkasan Isi': 'Dialog kepemudaan nasional di Hotel Bidakara Jakarta',
    },
    {
      'Tipe Surat (Surat Masuk / Surat Keluar)': 'Surat Keluar',
      'Nomor Surat': '045/SK/DPP-ORG/IX/2026',
      'Perihal / Judul': 'Surat Keputusan Pengangkatan Pengurus Wilayah',
      Pengirim: 'Dewan Pimpinan Pusat',
      Penerima: 'DPW Organisasi Jawa Barat',
      'Tanggal Surat (YYYY-MM-DD)': '2026-08-30',
      'Tanggal Diterima / Kirim (YYYY-MM-DD)': '2026-08-31',
      'Kategori (Undangan/Pemberitahuan/Permohonan/SK/Laporan/MoU/Lainnya)': 'Keputusan (SK)',
      'Sifat (Biasa/Penting/Segera/Rahasia)': 'Penting',
      'Status (Diterima/Diproses/Disposisi/Selesai/Terkirim/Diarsipkan)': 'Terkirim',
      'Catatan Disposisi': 'Tembusan kepada Dewan Pembina & Seluruh Bidang',
      'Ringkasan Isi': 'Pengesahan susunan pengurus wilayah periode 2026-2029',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 36 },
    { wch: 28 },
    { wch: 35 },
    { wch: 30 },
    { wch: 28 },
    { wch: 25 },
    { wch: 28 },
    { wch: 25 },
    { wch: 20 },
    { wch: 25 },
    { wch: 30 },
    { wch: 35 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template_Impor_Surat');
  XLSX.writeFile(workbook, 'Template_Impor_Surat_Organisasi.xlsx');
}

/**
 * Import Letters from uploaded file (Excel .xlsx/.xls, CSV, JSON, Word, or Scanned Image JPG/PNG)
 */
export async function importLettersFromFile(file: File): Promise<Partial<Letter>[]> {
  const fileNameLower = file.name.toLowerCase();

  // 1. JSON file import
  if (fileNameLower.endsWith('.json') || file.type === 'application/json') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parsed = JSON.parse(text);
          const list = Array.isArray(parsed) ? parsed : [parsed];
          const mapped: Partial<Letter>[] = list.map((item: any) => ({
            type: item.type === 'Surat Keluar' ? 'Surat Keluar' : 'Surat Masuk',
            nomorSurat: item.nomorSurat || `SRT-${Date.now().toString().slice(-4)}`,
            perihal: item.perihal || 'Surat Tanpa Perihal',
            pengirim: item.pengirim || (item.type === 'Surat Keluar' ? 'Dewan Pengurus' : 'Pihak Luar'),
            penerima: item.penerima || (item.type === 'Surat Masuk' ? 'Pengurus Organisasi' : 'Pihak Dituju'),
            tanggalSurat: item.tanggalSurat || new Date().toISOString().split('T')[0],
            tanggalDiterimaKirim: item.tanggalDiterimaKirim || item.tanggalSurat || new Date().toISOString().split('T')[0],
            kategori: item.kategori || 'Pemberitahuan',
            sifat: item.sifat || 'Biasa',
            status: item.status || 'Diterima',
            ringkasan: item.ringkasan || item.perihal || '',
            disposisiCatatan: item.disposisiCatatan || '',
            disposisiKepada: item.disposisiKepada || '',
            fileAttachment: item.fileAttachment || undefined,
          }));
          resolve(mapped);
        } catch (err: any) {
          reject(new Error(`Format JSON tidak valid: ${err.message}`));
        }
      };
      reader.onerror = () => reject(new Error('Gagal membaca file JSON.'));
      reader.readAsText(file);
    });
  }

  // 2. Scanned Image Import (JPG, PNG, JPEG, WEBP)
  if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp)$/i.test(fileNameLower)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        // Clean name without extension
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const isKeluar = fileNameLower.includes('keluar') || fileNameLower.includes('out');
        const randomNum = Math.floor(1000 + Math.random() * 9000);

        const newLetter: Partial<Letter> = {
          type: isKeluar ? 'Surat Keluar' : 'Surat Masuk',
          nomorSurat: `SCN/${new Date().getFullYear()}/${randomNum}`,
          perihal: cleanTitle || 'Hasil Scan Dokumen Surat',
          pengirim: isKeluar ? 'Dewan Pimpinan Organisasi' : 'Instansi Pengirim (Scan Fisik)',
          penerima: isKeluar ? 'Instansi Dituju' : 'Sekretariat & Arsip Organisasi',
          tanggalSurat: new Date().toISOString().split('T')[0],
          tanggalDiterimaKirim: new Date().toISOString().split('T')[0],
          kategori: 'Pemberitahuan',
          sifat: 'Penting',
          status: 'Diterima',
          ringkasan: `Arsip hasil pemindaian/foto dokumen (${file.name}, ${(file.size / 1024).toFixed(1)} KB).`,
          fileAttachment: {
            name: file.name,
            size: file.size,
            type: file.type || 'image/jpeg',
            format: 'image',
            dataUrl,
          },
        };
        resolve([newLetter]);
      };
      reader.onerror = () => reject(new Error('Gagal memproses berkas gambar surat.'));
      reader.readAsDataURL(file);
    });
  }

  // 3. Excel (.xlsx, .xls) and CSV
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!jsonRows || jsonRows.length === 0) {
          throw new Error('File tidak memiliki data atau baris kosong.');
        }

        const parsedLetters: Partial<Letter>[] = jsonRows.map((row) => {
          // Flexible mapping supporting different column headers
          const typeRaw =
            row['Tipe Surat (Surat Masuk / Surat Keluar)'] ||
            row['Tipe Surat'] ||
            row['Tipe'] ||
            row['Jenis'] ||
            'Surat Masuk';
          const type = typeRaw.toString().toLowerCase().includes('keluar') ? 'Surat Keluar' : 'Surat Masuk';

          const nomorSurat =
            row['Nomor Surat'] ||
            row['No Surat'] ||
            row['Nomor'] ||
            `SRT-${Date.now().toString().slice(-4)}`;

          const perihal =
            row['Perihal / Judul'] ||
            row['Perihal'] ||
            row['Judul'] ||
            row['Hal'] ||
            'Surat Tanpa Perihal';

          const pengirim =
            row['Pengirim'] ||
            row['Asal Surat'] ||
            row['Instansi Pengirim'] ||
            (type === 'Surat Keluar' ? 'Organisasi Pusat' : 'Pihak Luar');

          const penerima =
            row['Penerima'] ||
            row['Tujuan Surat'] ||
            row['Kepada'] ||
            (type === 'Surat Masuk' ? 'Pengurus Organisasi' : 'Pihak Dituju');

          const tanggalSurat =
            row['Tanggal Surat (YYYY-MM-DD)'] ||
            row['Tanggal Surat'] ||
            row['Tanggal'] ||
            new Date().toISOString().split('T')[0];

          const tanggalDiterimaKirim =
            row['Tanggal Diterima / Kirim (YYYY-MM-DD)'] ||
            row['Tanggal Diterima'] ||
            row['Tanggal Kirim'] ||
            tanggalSurat;

          const kategori =
            row['Kategori (Undangan/Pemberitahuan/Permohonan/SK/Laporan/MoU/Lainnya)'] ||
            row['Kategori'] ||
            'Pemberitahuan';

          const sifat =
            row['Sifat (Biasa/Penting/Segera/Rahasia)'] || row['Sifat'] || 'Biasa';

          const status =
            row['Status (Diterima/Diproses/Disposisi/Selesai/Terkirim/Diarsipkan)'] ||
            row['Status'] ||
            (type === 'Surat Masuk' ? 'Diterima' : 'Terkirim');

          const ringkasan =
            row['Ringkasan Isi'] || row['Ringkasan'] || row['Catatan'] || perihal;

          const disposisiCatatan = row['Catatan Disposisi'] || row['Disposisi'] || '';

          return {
            type,
            nomorSurat: nomorSurat.toString().trim(),
            perihal: perihal.toString().trim(),
            pengirim: pengirim.toString().trim(),
            penerima: penerima.toString().trim(),
            tanggalSurat: tanggalSurat.toString().trim(),
            tanggalDiterimaKirim: tanggalDiterimaKirim.toString().trim(),
            kategori: kategori.toString().trim(),
            sifat: sifat.toString().trim() as any,
            status: status.toString().trim() as any,
            ringkasan: ringkasan.toString().trim(),
            disposisiCatatan: disposisiCatatan.toString().trim(),
          };
        });

        resolve(parsedLetters);
      } catch (err: any) {
        reject(new Error(err.message || 'Gagal membaca file lembar kerja.'));
      }
    };

    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Helper to download or open letter attachment
 */
export function downloadAttachment(attachment: { name: string; dataUrl?: string }) {
  if (!attachment.dataUrl) {
    alert('Berkas lampiran tidak memiliki data unduhan.');
    return;
  }
  const a = document.createElement('a');
  a.href = attachment.dataUrl;
  a.download = attachment.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Export a single letter to a styled Word Document (.doc)
 */
export function exportSingleLetterToWord(letter: Letter) {
  const printedDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${letter.nomorSurat}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #1e293b; margin: 30px; line-height: 1.6; }
        .kop { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
        .kop h1 { margin: 0; font-size: 16pt; color: #0f172a; text-transform: uppercase; }
        .kop p { margin: 4px 0 0 0; font-size: 10pt; color: #64748b; }
        .badge { display: inline-block; padding: 4px 10px; background: #e0f2fe; color: #0369a1; font-weight: bold; border-radius: 4px; font-size: 9pt; }
        .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .meta-table td { padding: 6px 10px; vertical-align: top; }
        .meta-label { width: 180px; font-weight: bold; color: #475569; }
        .section-title { font-size: 12pt; font-weight: bold; color: #1e40af; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 20px; margin-bottom: 8px; }
        .content-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 6px; margin-bottom: 20px; }
        .disposisi-box { background: #fef3c7; border: 1px solid #fde68a; padding: 12px; border-radius: 6px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="kop">
        <h1>AGENDA RESMI PERSURATAN ORGANISASI</h1>
        <p>Lembar Registrasi Arsip Elektronik Dokumen Kedinasan Organisasi</p>
      </div>

      <div style="margin-bottom: 15px;">
        <span class="badge">${letter.type.toUpperCase()}</span>
      </div>

      <table class="meta-table">
        <tr>
          <td class="meta-label">Nomor Surat</td>
          <td>: <strong>${letter.nomorSurat}</strong></td>
        </tr>
        <tr>
          <td class="meta-label">Tanggal Surat</td>
          <td>: ${letter.tanggalSurat}</td>
        </tr>
        <tr>
          <td class="meta-label">Tanggal ${letter.type === 'Surat Masuk' ? 'Diterima' : 'Dikirim'}</td>
          <td>: ${letter.tanggalDiterimaKirim}</td>
        </tr>
        <tr>
          <td class="meta-label">Asal Pengirim</td>
          <td>: <strong>${letter.pengirim}</strong></td>
        </tr>
        <tr>
          <td class="meta-label">Ditujukan Kepada</td>
          <td>: <strong>${letter.penerima}</strong></td>
        </tr>
        <tr>
          <td class="meta-label">Kategori / Klasifikasi</td>
          <td>: ${letter.kategori}</td>
        </tr>
        <tr>
          <td class="meta-label">Tingkat Urgensi / Sifat</td>
          <td>: ${letter.sifat}</td>
        </tr>
        <tr>
          <td class="meta-label">Status Dokumen</td>
          <td>: ${letter.status}</td>
        </tr>
        ${letter.fileAttachment ? `<tr><td class="meta-label">Lampiran Berkas</td><td>: ${letter.fileAttachment.name} (${letter.fileAttachment.format.toUpperCase()})</td></tr>` : ''}
      </table>

      <div class="section-title">PERIHAL / POKOK SURAT</div>
      <p style="font-size: 13pt; font-weight: bold; margin: 6px 0 12px 0;">${letter.perihal}</p>

      <div class="section-title">RINGKASAN SUBSTANSI SURAT</div>
      <div class="content-box">
        ${letter.ringkasan || 'Tidak ada ringkasan teks terlampir.'}
      </div>

      ${letter.disposisiCatatan ? `
        <div class="disposisi-box">
          <strong style="color: #92400e;">INSTRUKSI / DISPOSISI PIMPINAN:</strong>
          <p style="margin: 6px 0 0 0; color: #78350f;">${letter.disposisiCatatan}</p>
          ${letter.disposisiKepada ? `<p style="margin: 4px 0 0 0; font-size: 10pt; color: #92400e;">Disposisi kepada: <strong>${letter.disposisiKepada}</strong></p>` : ''}
        </div>
      ` : ''}

      <div style="margin-top: 40px; font-size: 9pt; color: #94a3b8; text-align: right;">
        Dicetak dari Sistem Administrasi Organisasi pada ${printedDate}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = letter.nomorSurat.replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `Surat_${safeName}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
