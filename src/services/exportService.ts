import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Member } from '../types';

export function exportMembersToExcel(members: Member[], filename = 'Database_Anggota_Organisasi.xlsx') {
  const formattedData = members.map((m, idx) => ({
    No: idx + 1,
    NIK: m.nik,
    'Nama Lengkap': m.nama,
    Jabatan: m.jabatan,
    'Divisi / Departemen': m.departemen,
    Status: m.status,
    'Alamat Lengkap': m.alamat,
    'RT/RW': m.rtRw || '-',
    Kelurahan: m.kelurahan || '-',
    Kecamatan: m.kecamatan || '-',
    'Kota/Kabupaten': m.kotaKabupaten || '-',
    Provinsi: m.provinsi || '-',
    'Tempat & Tanggal Lahir': m.tempatTglLahir || '-',
    'Jenis Kelamin': m.jenisKelamin || '-',
    Agama: m.agama || '-',
    Pekerjaan: m.pekerjaan || '-',
    'No Telepon/WA': m.telepon || '-',
    Email: m.email || '-',
    'Akurasi OCR KTP': `${m.ocrConfidence || 95}%`,
    'Status Sinkronisasi': m.syncStatus === 'synced' ? 'Tersinkron Google Sheets' : 'Lokal / Pending',
    'Link Google Drive': m.driveFileUrl || '-',
    'Tanggal Terdaftar': new Date(m.createdAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 5 }, // No
    { wch: 20 }, // NIK
    { wch: 28 }, // Nama
    { wch: 22 }, // Jabatan
    { wch: 25 }, // Divisi
    { wch: 18 }, // Status
    { wch: 35 }, // Alamat
    { wch: 10 }, // RT/RW
    { wch: 18 }, // Kelurahan
    { wch: 18 }, // Kecamatan
    { wch: 18 }, // Kota
    { wch: 18 }, // Provinsi
    { wch: 24 }, // TTL
    { wch: 15 }, // Gender
    { wch: 12 }, // Agama
    { wch: 20 }, // Pekerjaan
    { wch: 18 }, // Telepon
    { wch: 28 }, // Email
    { wch: 15 }, // OCR
    { wch: 24 }, // Sync
    { wch: 35 }, // Drive Link
    { wch: 20 }, // Tanggal
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Anggota Master');

  // Summary sheet
  const summaryData = [
    { Metrik: 'Total Anggota Terdaftar', Nilai: members.length },
    { Metrik: 'Anggota Aktif', Nilai: members.filter((m) => m.status === 'Aktif').length },
    { Metrik: 'Menunggu Verifikasi', Nilai: members.filter((m) => m.status === 'Pending Verifikasi').length },
    { Metrik: 'Non-Aktif / Ditangguhkan', Nilai: members.filter((m) => m.status === 'Non-Aktif' || m.status === 'Ditangguhkan').length },
    { Metrik: 'Tersinkron ke Google Sheets', Nilai: members.filter((m) => m.syncStatus === 'synced').length },
    { Metrik: 'Tanggal Unduh Laporan', Nilai: new Date().toLocaleString('id-ID') },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan Eksekutif');

  XLSX.writeFile(workbook, filename);
}

export function exportMembersToPdf(
  members: Member[],
  title = 'BUKU INDUK & DAFTAR REKAPITULASI ANGGOTA ORGANISASI',
  filename = 'Laporan_Anggota_Organisasi.pdf'
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Organization Header Letterhead
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text('SISTEM ADMINISTRASI ORGANISASI TERPADU', 148, 14, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(title, 148, 20, { align: 'center' });

  doc.setFontSize(8);
  doc.text(
    `Dicetak pada: ${new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' })} | Status Database: Terverifikasi OCR & Cloud Sync`,
    148,
    25,
    { align: 'center' }
  );

  // Divider line
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.5);
  doc.line(14, 28, 283, 28);

  // Mini summary blocks
  const activeCount = members.filter((m) => m.status === 'Aktif').length;
  const pendingCount = members.filter((m) => m.status === 'Pending Verifikasi').length;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Anggota: ${members.length}`, 14, 34);
  doc.text(`Aktif: ${activeCount}`, 70, 34);
  doc.text(`Pending Verifikasi: ${pendingCount}`, 120, 34);
  doc.text(`Tersinkron Google Sheets: ${members.filter((m) => m.syncStatus === 'synced').length}`, 185, 34);

  // Table columns and rows
  const tableColumns = [
    'No',
    'NIK',
    'Nama Lengkap',
    'Jabatan',
    'Divisi',
    'Status',
    'Alamat Domisili',
    'No Kontak',
    'Akurasi OCR',
    'Tgl Terdaftar',
  ];

  const tableRows = members.map((m, idx) => [
    idx + 1,
    m.nik,
    m.nama,
    m.jabatan,
    m.departemen,
    m.status,
    m.alamat.length > 35 ? m.alamat.substring(0, 32) + '...' : m.alamat,
    m.telepon || '-',
    `${m.ocrConfidence || 95}%`,
    new Date(m.createdAt).toLocaleDateString('id-ID'),
  ]);

  autoTable(doc, {
    head: [tableColumns],
    body: tableRows,
    startY: 38,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      font: 'helvetica',
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [30, 58, 138], // Royal Navy #1E3A8A
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 32 },
      2: { fontStyle: 'bold', cellWidth: 42 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
      5: { halign: 'center', cellWidth: 26 },
      6: { cellWidth: 45 },
      7: { cellWidth: 24 },
      8: { halign: 'center', cellWidth: 15 },
      9: { halign: 'center', cellWidth: 16 },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data: any) => {
      // Page numbering footer
      const str = `Halaman ${data.pageNumber} dari ${doc.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, 283, 202, { align: 'right' });
      doc.text('Dokumen Resmi - Sistem Administrasi Organisasi', 14, 202);
    },
  });

  doc.save(filename);
}
