import React, { useState, useMemo, useRef } from 'react';
import {
  Mail,
  Inbox,
  Send,
  Plus,
  Search,
  Download,
  Upload,
  FileText,
  FileSpreadsheet,
  File,
  Eye,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  Clock,
  Archive,
  Paperclip,
  X,
  Sparkles,
  AlertCircle,
  FileCheck,
  CheckSquare,
  Square,
  Image,
  Code2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  Letter,
  LetterType,
  LetterCategory,
  LetterStatus,
  LetterUrgency,
  LetterAttachment,
} from '../types';
import {
  exportLettersToExcel,
  exportLettersToPdf,
  exportLettersToWord,
  exportLettersToJpg,
  exportLettersToJson,
  exportSingleLetterToWord,
  exportSingleLetterToJpg,
  importLettersFromFile,
  downloadLetterImportTemplate,
  downloadAttachment,
} from '../services/letterExportService';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export const LettersPage: React.FC = () => {
  const {
    letters,
    addLetter,
    updateLetter,
    deleteLetter,
    deleteMultipleLetters,
    importLettersBatch,
    currentUser,
  } = useApp();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | LetterType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LetterStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [editingLetter, setEditingLetter] = useState<Letter | null>(null);

  // Deletion modal states
  const [deleteTarget, setDeleteTarget] = useState<Letter | null>(null);
  const [isDeletingSingle, setIsDeletingSingle] = useState(false);
  const [selectedLetterIds, setSelectedLetterIds] = useState<string[]>([]);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);

  // Form State for Create / Edit
  const [formType, setFormType] = useState<LetterType>('Surat Masuk');
  const [formNomorSurat, setFormNomorSurat] = useState('');
  const [formTanggalSurat, setFormTanggalSurat] = useState(new Date().toISOString().split('T')[0]);
  const [formTanggalDiterimaKirim, setFormTanggalDiterimaKirim] = useState(new Date().toISOString().split('T')[0]);
  const [formPengirim, setFormPengirim] = useState('');
  const [formPenerima, setFormPenerima] = useState('');
  const [formPerihal, setFormPerihal] = useState('');
  const [formKategori, setFormKategori] = useState<LetterCategory>('Undangan');
  const [formSifat, setFormSifat] = useState<LetterUrgency>('Biasa');
  const [formRingkasan, setFormRingkasan] = useState('');
  const [formStatus, setFormStatus] = useState<LetterStatus>('Diterima');
  const [formDisposisiCatatan, setFormDisposisiCatatan] = useState('');
  const [formDisposisiKepada, setFormDisposisiKepada] = useState('');
  const [formAttachment, setFormAttachment] = useState<LetterAttachment | undefined>(undefined);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // Filtered letters
  const filteredLetters = useMemo(() => {
    return letters.filter((letter) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        letter.nomorSurat.toLowerCase().includes(q) ||
        letter.perihal.toLowerCase().includes(q) ||
        letter.pengirim.toLowerCase().includes(q) ||
        letter.penerima.toLowerCase().includes(q) ||
        letter.ringkasan.toLowerCase().includes(q);

      const matchType = typeFilter === 'ALL' || letter.type === typeFilter;
      const matchStatus = statusFilter === 'ALL' || letter.status === statusFilter;
      const matchCategory = categoryFilter === 'ALL' || letter.kategori === categoryFilter;

      return matchSearch && matchType && matchStatus && matchCategory;
    });
  }, [letters, searchQuery, typeFilter, statusFilter, categoryFilter]);

  // Statistics
  const totalLetters = letters.length;
  const incomingCount = letters.filter((l) => l.type === 'Surat Masuk').length;
  const outgoingCount = letters.filter((l) => l.type === 'Surat Keluar').length;
  const archivedCount = letters.filter((l) => l.status === 'Diarsipkan' || l.status === 'Selesai').length;

  const handleOpenCreate = () => {
    setEditingLetter(null);
    setFormType('Surat Masuk');
    setFormNomorSurat(`ORG/SM/${new Date().getFullYear()}/${String(letters.length + 1).padStart(3, '0')}`);
    setFormTanggalSurat(new Date().toISOString().split('T')[0]);
    setFormTanggalDiterimaKirim(new Date().toISOString().split('T')[0]);
    setFormPengirim('');
    setFormPenerima('Ketua Umum & Sekretariat Organisasi');
    setFormPerihal('');
    setFormKategori('Undangan');
    setFormSifat('Biasa');
    setFormRingkasan('');
    setFormStatus('Diterima');
    setFormDisposisiCatatan('');
    setFormDisposisiKepada('');
    setFormAttachment(undefined);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (letter: Letter) => {
    setEditingLetter(letter);
    setFormType(letter.type);
    setFormNomorSurat(letter.nomorSurat);
    setFormTanggalSurat(letter.tanggalSurat);
    setFormTanggalDiterimaKirim(letter.tanggalDiterimaKirim);
    setFormPengirim(letter.pengirim);
    setFormPenerima(letter.penerima);
    setFormPerihal(letter.perihal);
    setFormKategori(letter.kategori as LetterCategory);
    setFormSifat(letter.sifat);
    setFormRingkasan(letter.ringkasan);
    setFormStatus(letter.status);
    setFormDisposisiCatatan(letter.disposisiCatatan || '');
    setFormDisposisiKepada(letter.disposisiKepada || '');
    setFormAttachment(letter.fileAttachment);
    setFormModalOpen(true);
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      let format: LetterAttachment['format'] = 'other';
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'pdf') format = 'pdf';
      else if (ext === 'doc' || ext === 'docx') format = 'word';
      else if (ext === 'xls' || ext === 'xlsx') format = 'excel';
      else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) format = 'image';

      setFormAttachment({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        format,
        dataUrl: base64Data,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNomorSurat.trim() || !formPerihal.trim() || !formPengirim.trim() || !formPenerima.trim()) {
      alert('Mohon lengkapi seluruh kolom wajib.');
      return;
    }

    setFormSubmitting(true);
    try {
      const payload: Partial<Letter> = {
        type: formType,
        nomorSurat: formNomorSurat.trim(),
        tanggalSurat: formTanggalSurat,
        tanggalDiterimaKirim: formTanggalDiterimaKirim,
        pengirim: formPengirim.trim(),
        penerima: formPenerima.trim(),
        perihal: formPerihal.trim(),
        kategori: formKategori,
        sifat: formSifat,
        ringkasan: formRingkasan.trim(),
        status: formStatus,
        disposisiCatatan: formDisposisiCatatan.trim(),
        disposisiKepada: formDisposisiKepada.trim(),
        fileAttachment: formAttachment,
      };

      if (editingLetter) {
        await updateLetter(editingLetter.id, payload);
      } else {
        await addLetter(payload);
      }
      setFormModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data surat.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const isAllVisibleSelected =
    filteredLetters.length > 0 &&
    filteredLetters.every((l) => selectedLetterIds.includes(l.id));

  const handleToggleSelectAll = () => {
    if (isAllVisibleSelected) {
      const visibleIds = new Set(filteredLetters.map((l) => l.id));
      setSelectedLetterIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      const newIds = new Set([...selectedLetterIds, ...filteredLetters.map((l) => l.id)]);
      setSelectedLetterIds(Array.from(newIds));
    }
  };

  const handleToggleSelectLetter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLetterIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteLetterClick = (letter: Letter, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteTarget(letter);
  };

  const handleImportFile = async () => {
    if (!importFile) return;
    setImportLoading(true);
    setImportMessage(null);
    try {
      const imported = await importLettersFromFile(importFile);
      if (imported.length === 0) {
        setImportMessage('Tidak ada baris data surat yang dapat diproses dari file tersebut.');
        return;
      }
      await importLettersBatch(imported);
      setImportMessage(`Berhasil mengimpor ${imported.length} data surat ke agenda arsip!`);
      setTimeout(() => {
        setImportModalOpen(false);
        setImportFile(null);
        setImportMessage(null);
      }, 1200);
    } catch (err: any) {
      setImportMessage(`Gagal memproses file: ${err.message}`);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Manajemen Surat Masuk & Keluar</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Agenda persuratan resmi organisasi, disposisi, pengarsipan lampiran digital, ekspor & impor multi-format.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Batch Delete Button */}
          {selectedLetterIds.length > 0 && (
            <button
              id="letters-batch-delete-btn"
              type="button"
              onClick={() => setShowBatchDeleteModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 shadow-sm transition-colors animate-in fade-in"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Terpilih ({selectedLetterIds.length})</span>
            </button>
          )}

          {/* Export Buttons */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-xs">
            <button
              onClick={() => exportLettersToExcel(filteredLetters)}
              title="Ekspor ke Excel (.xlsx)"
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
            <button
              onClick={() => exportLettersToPdf(filteredLetters)}
              title="Ekspor ke PDF (.pdf)"
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => exportLettersToWord(filteredLetters)}
              title="Ekspor Agenda ke Word (.doc)"
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-1.5 transition-colors"
            >
              <File className="w-3.5 h-3.5" />
              <span>Word</span>
            </button>
            <button
              onClick={() => exportLettersToJpg(filteredLetters)}
              title="Ekspor Rekap Agenda ke Format Gambar (.jpg)"
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-1.5 transition-colors"
            >
              <Image className="w-3.5 h-3.5" />
              <span>JPG</span>
            </button>
            <button
              onClick={() => exportLettersToJson(filteredLetters)}
              title="Ekspor Data JSON (.json)"
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>

          {/* Import Button */}
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-3 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-4 h-4 text-indigo-500" />
            <span>Impor Berkas</span>
          </button>

          {/* New Letter Button */}
          <button
            onClick={handleOpenCreate}
            id="btn-catat-surat-baru"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Surat Baru</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Total Dokumen Surat</span>
            <Mail className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalLetters}</div>
          <div className="text-[11px] text-slate-400 mt-1">Seluruh agenda persuratan</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Surat Masuk</span>
            <Inbox className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{incomingCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalLetters > 0 ? Math.round((incomingCount / totalLetters) * 100) : 0}% dari total agenda
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Surat Keluar</span>
            <Send className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{outgoingCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Surat dinas resmi organisasi</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Selesai / Diarsipkan</span>
            <Archive className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{archivedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Disposisi & tindak lanjut tuntas</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor surat, perihal, pengirim, atau penerima..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Jenis Surat</option>
              <option value="Surat Masuk">Surat Masuk</option>
              <option value="Surat Keluar">Surat Keluar</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="Diterima">Diterima</option>
              <option value="Diproses">Diproses</option>
              <option value="Disposisi">Disposisi</option>
              <option value="Selesai">Selesai</option>
              <option value="Terkirim">Terkirim</option>
              <option value="Diarsipkan">Diarsipkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Letters Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    title="Pilih Semua Surat"
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors inline-flex items-center justify-center"
                  >
                    {isAllVisibleSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">No & Tanggal Surat</th>
                <th className="py-3.5 px-4">Jenis & Kategori</th>
                <th className="py-3.5 px-4">Pengirim / Penerima</th>
                <th className="py-3.5 px-4">Perihal</th>
                <th className="py-3.5 px-4">Lampiran Berkas</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLetters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Mail className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">
                      Tidak ada dokumen surat ditemukan
                    </p>
                    <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau filter.</p>
                  </td>
                </tr>
              ) : (
                filteredLetters.map((letter) => (
                  <tr
                    key={letter.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      selectedLetterIds.includes(letter.id) ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleToggleSelectLetter(letter.id, e)}
                        title={`Pilih surat ${letter.nomorSurat}`}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors inline-flex items-center justify-center"
                      >
                        {selectedLetterIds.includes(letter.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Nomor & Tanggal */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        {letter.nomorSurat}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{letter.tanggalSurat}</span>
                      </div>
                    </td>

                    {/* Jenis & Kategori */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          letter.type === 'Surat Masuk'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        {letter.type === 'Surat Masuk' ? (
                          <Inbox className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Send className="w-3 h-3 text-blue-600" />
                        )}
                        {letter.type}
                      </span>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {letter.kategori}
                      </div>
                    </td>

                    {/* Pengirim / Penerima */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {letter.pengirim}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Tujuan: <span className="text-slate-600 dark:text-slate-300">{letter.penerima}</span>
                      </div>
                    </td>

                    {/* Perihal */}
                    <td className="py-3 px-4 max-w-[220px]">
                      <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2" title={letter.perihal}>
                        {letter.perihal}
                      </div>
                      {letter.ringkasan && (
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {letter.ringkasan}
                        </div>
                      )}
                    </td>

                    {/* Lampiran */}
                    <td className="py-3 px-4">
                      {letter.fileAttachment ? (
                        <button
                          type="button"
                          onClick={() => downloadAttachment(letter.fileAttachment!)}
                          className="inline-flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800/60 max-w-[150px] truncate transition-colors"
                          title={letter.fileAttachment.name}
                        >
                          <Paperclip className="w-3 h-3 shrink-0" />
                          <span className="truncate">{letter.fileAttachment.name}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          letter.status === 'Diarsipkan' || letter.status === 'Selesai'
                            ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : letter.status === 'Diproses' || letter.status === 'Disposisi'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : letter.status === 'Terkirim'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {letter.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedLetter(letter);
                            setDetailModalOpen(true);
                          }}
                          title="Lihat Detail & Disposisi"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => exportSingleLetterToWord(letter)}
                          title="Unduh Lembar Dokumen Word (.doc)"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                        >
                          <File className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(letter)}
                          title="Edit Surat"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteLetterClick(letter, e)}
                          title="Hapus Dokumen Surat"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Menampilkan <strong className="text-slate-700 dark:text-slate-200">{filteredLetters.length}</strong> dari{' '}
            <strong className="text-slate-700 dark:text-slate-200">{letters.length}</strong> arsip surat
          </span>
          <span>Buku Agenda Persuratan Organisasi</span>
        </div>
      </div>

      {/* MODAL: CREATE / EDIT LETTER */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {editingLetter ? 'Ubah Data Surat' : 'Catat Surat Masuk / Keluar Baru'}
                  </h3>
                  <p className="text-xs text-slate-400">Buku agenda persuratan digital organisasi</p>
                </div>
              </div>
              <button
                onClick={() => setFormModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Jenis Surat */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jenis Surat *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as LetterType)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Surat Masuk">Surat Masuk</option>
                    <option value="Surat Keluar">Surat Keluar</option>
                  </select>
                </div>

                {/* Kategori Surat */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Surat *
                  </label>
                  <select
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value as LetterCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Undangan">Undangan Resmi</option>
                    <option value="Keputusan (SK)">Keputusan (SK)</option>
                    <option value="Pemberitahuan">Pemberitahuan</option>
                    <option value="Permohonan">Permohonan Kerjasama</option>
                    <option value="Laporan">Laporan Pertanggungjawaban</option>
                    <option value="Kerjasama (MoU)">Kerjasama (MoU)</option>
                    <option value="Tugas / Mandat">Surat Tugas / Mandat</option>
                    <option value="Edaran">Surat Edaran</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Nomor Surat */}
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Surat *
                  </label>
                  <input
                    type="text"
                    value={formNomorSurat}
                    onChange={(e) => setFormNomorSurat(e.target.value)}
                    placeholder="ORG/SM/2026/001"
                    required
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Tanggal Surat */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Surat *
                  </label>
                  <input
                    type="date"
                    value={formTanggalSurat}
                    onChange={(e) => setFormTanggalSurat(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Tanggal Diterima / Dikirim */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {formType === 'Surat Masuk' ? 'Tanggal Diterima *' : 'Tanggal Dikirim *'}
                  </label>
                  <input
                    type="date"
                    value={formTanggalDiterimaKirim}
                    onChange={(e) => setFormTanggalDiterimaKirim(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pengirim */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Asal / Pengirim Surat *
                  </label>
                  <input
                    type="text"
                    value={formPengirim}
                    onChange={(e) => setFormPengirim(e.target.value)}
                    placeholder="Nama instansi / lembaga / pejabat pengirim"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Penerima / Tujuan */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ditujukan Kepada *
                  </label>
                  <input
                    type="text"
                    value={formPenerima}
                    onChange={(e) => setFormPenerima(e.target.value)}
                    placeholder="Penerima surat / pimpinan / divisi"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Perihal */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Perihal / Pokok Surat *
                </label>
                <input
                  type="text"
                  value={formPerihal}
                  onChange={(e) => setFormPerihal(e.target.value)}
                  placeholder="Ringkasan perihal resmi surat..."
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Ringkasan Isi Surat */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ringkasan Isi Surat
                </label>
                <textarea
                  rows={2}
                  value={formRingkasan}
                  onChange={(e) => setFormRingkasan(e.target.value)}
                  placeholder="Uraian singkat substansi surat atau agenda kegiatan..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status, Sifat, & Disposisi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Dokumen
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as LetterStatus)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Diterima">Diterima</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Disposisi">Disposisi</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Terkirim">Terkirim</option>
                    <option value="Diarsipkan">Diarsipkan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sifat / Urgensi
                  </label>
                  <select
                    value={formSifat}
                    onChange={(e) => setFormSifat(e.target.value as LetterUrgency)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Biasa">Biasa</option>
                    <option value="Penting">Penting</option>
                    <option value="Segera">Segera</option>
                    <option value="Rahasia">Rahasia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Disposisi Kepada
                  </label>
                  <input
                    type="text"
                    value={formDisposisiKepada}
                    onChange={(e) => setFormDisposisiKepada(e.target.value)}
                    placeholder="Jabatan / Divisi penerima"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Catatan Disposisi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan / Instruksi Disposisi Pimpinan
                </label>
                <input
                  type="text"
                  value={formDisposisiCatatan}
                  onChange={(e) => setFormDisposisiCatatan(e.target.value)}
                  placeholder="Instruksi pimpinan (misal: Pelajari dan koordinasikan dengan bidang terkait)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Multi-Format Lampiran Berkas Upload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Lampiran Berkas (PDF, Word, Excel, JPG, PNG)
                  </label>
                  <button
                    type="button"
                    onClick={() => attachmentInputRef.current?.click()}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Pilih Berkas</span>
                  </button>
                  <input
                    ref={attachmentInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                    onChange={handleAttachmentUpload}
                    className="hidden"
                  />
                </div>

                {!formAttachment ? (
                  <div
                    onClick={() => attachmentInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <Paperclip className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                    <p className="text-xs text-slate-500">Klik untuk melampirkan berkas fisik surat (PDF/Word/Excel/JPG/PNG)</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                        {formAttachment.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({Math.round(formAttachment.size / 1024)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormAttachment(undefined)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-50"
                >
                  {formSubmitting ? 'Menyimpan...' : editingLetter ? 'Simpan Perubahan' : 'Catat ke Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LETTER DETAIL & ATTACHMENT PREVIEW */}
      {detailModalOpen && selectedLetter && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    selectedLetter.type === 'Surat Masuk'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  }`}
                >
                  {selectedLetter.type}
                </span>
                <h3 className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {selectedLetter.nomorSurat}
                </h3>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Main Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Pengirim:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {selectedLetter.pengirim}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Tujuan / Penerima:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {selectedLetter.penerima}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Tanggal Surat:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {selectedLetter.tanggalSurat}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">
                    {selectedLetter.type === 'Surat Masuk' ? 'Diterima Pada:' : 'Dikirim Pada:'}
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {selectedLetter.tanggalDiterimaKirim}
                  </span>
                </div>
              </div>

              {/* Perihal & Ringkasan */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Perihal Surat
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {selectedLetter.perihal}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {selectedLetter.ringkasan || 'Tidak ada ringkasan teks.'}
                </div>
              </div>

              {/* Disposisi */}
              {selectedLetter.disposisiCatatan && (
                <div className="space-y-1 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs">
                  <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Disposisi Pimpinan Organisasi:
                  </span>
                  <p className="text-amber-900 dark:text-amber-200 mt-1">{selectedLetter.disposisiCatatan}</p>
                  {selectedLetter.disposisiKepada && (
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                      Diteruskan kepada: <strong>{selectedLetter.disposisiKepada}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Attachment */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Berkas Lampiran
                </div>

                {selectedLetter.fileAttachment ? (
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
                    <div className="flex items-center gap-2.5 truncate">
                      <FileCheck className="w-5 h-5 text-blue-500 shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                          {selectedLetter.fileAttachment.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Format: {selectedLetter.fileAttachment.format.toUpperCase()} (
                          {Math.round(selectedLetter.fileAttachment.size / 1024)} KB)
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => downloadAttachment(selectedLetter.fileAttachment!)}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Berkas</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Tidak ada berkas lampiran terdaftar.</p>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleDeleteLetterClick(selectedLetter)}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Surat</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => exportSingleLetterToJpg(selectedLetter)}
                    className="px-3 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Image className="w-4 h-4" />
                    <span>Format JPG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => exportSingleLetterToWord(selectedLetter)}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <File className="w-4 h-4" />
                    <span>Format Word</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MULTI-FORMAT IMPORT (Excel, CSV, Word, JPG, PNG, JSON) */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Impor Berkas Surat Segala Format
                </h3>
              </div>
              <button
                onClick={() => setImportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Unggah berkas agenda persuratan dalam berbagai format: <strong>Excel (.xlsx, .xls)</strong>,{' '}
                <strong>CSV</strong>, <strong>Foto/Scan Gambar (JPG, PNG, JPEG)</strong>, <strong>Word</strong>, atau <strong>JSON</strong>. Sistem akan mengekstrak data dan mencatatkannya ke agenda arsip otomatis.
              </p>

              {/* Supported Format Pills */}
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                  Excel (.xlsx, .xls)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                  Word (.doc, .docx)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800">
                  Scan Dokumen (JPG, PNG)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800">
                  JSON / CSV
                </span>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
              >
                <Upload className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {importFile ? importFile.name : 'Klik untuk memilih file dokumen (Excel, JPG, PDF, Word, JSON)'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Mendukung .xlsx, .xls, .csv, .json, .jpg, .jpeg, .png, .doc, .docx
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.json,.jpg,.jpeg,.png,.webp,.doc,.docx,.txt"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setImportFile(f);
                  }}
                  className="hidden"
                />
              </div>

              {/* Download Template helper */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">Belum punya format file?</span>
                <button
                  type="button"
                  onClick={() => downloadLetterImportTemplate()}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Unduh Template Excel</span>
                </button>
              </div>

              {importMessage && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-blue-500" />
                  <span>{importMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  disabled={!importFile || importLoading}
                  onClick={handleImportFile}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{importLoading ? 'Memproses Impor...' : 'Mulai Impor'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Letter Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Hapus Dokumen Surat"
        itemTitle={deleteTarget?.nomorSurat}
        itemSubtitle={deleteTarget?.perihal}
        itemBadge={deleteTarget?.type}
        itemBadgeColor={deleteTarget?.type === 'Surat Masuk' ? 'emerald' : 'blue'}
        description={`Apakah Anda yakin ingin menghapus arsip dokumen surat "${deleteTarget?.nomorSurat}" (${deleteTarget?.perihal})? Tindakan ini akan menghapus data secara permanen dari agenda arsip.`}
        isLoading={isDeletingSingle}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setIsDeletingSingle(true);
          try {
            await deleteLetter(deleteTarget.id);
            setSelectedLetterIds((prev) => prev.filter((id) => id !== deleteTarget.id));
            if (selectedLetter?.id === deleteTarget.id) {
              setDetailModalOpen(false);
              setSelectedLetter(null);
            }
            setDeleteTarget(null);
          } finally {
            setIsDeletingSingle(false);
          }
        }}
        onCancel={() => {
          if (!isDeletingSingle) setDeleteTarget(null);
        }}
      />

      {/* Batch Letters Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showBatchDeleteModal}
        title="Hapus Beberapa Dokumen Surat"
        count={selectedLetterIds.length}
        description={`Apakah Anda yakin ingin menghapus ${selectedLetterIds.length} arsip dokumen surat yang dipilih secara permanen dari agenda arsip? Data yang telah dihapus tidak dapat dipulihkan.`}
        isLoading={isBatchDeleting}
        onConfirm={async () => {
          setIsBatchDeleting(true);
          try {
            await deleteMultipleLetters(selectedLetterIds);
            setSelectedLetterIds([]);
            setShowBatchDeleteModal(false);
          } finally {
            setIsBatchDeleting(false);
          }
        }}
        onCancel={() => {
          if (!isBatchDeleting) setShowBatchDeleteModal(false);
        }}
      />
    </div>
  );
};
