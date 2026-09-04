import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  HardDrive,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit2,
  Sparkles,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  Calendar,
  User,
  Trash2,
} from 'lucide-react';
import { Member, MemberStatus } from '../types';
import { useApp } from '../context/AppContext';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface MemberDetailModalProps {
  member: Member | null;
  onClose: () => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({ member, onClose }) => {
  const { updateMember, deleteMember, verifyMemberKtp, currentUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState<MemberStatus>(member?.status || 'Aktif');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!member) return null;

  const handleSaveStatus = async () => {
    await updateMember(member.id, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const handleVerify = async () => {
    await verifyMemberKtp(member.id);
    onClose();
  };

  const handleDeleteMember = () => {
    setShowDeleteModal(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              {member.nama.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {member.nama}
              </h3>
              <p className="text-xs text-slate-500 font-mono">NIK: {member.nik}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Status & Confidence Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Status Keanggotaan</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5 mt-0.5">
                {member.status === 'Aktif' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                )}
                {member.status}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Akurasi Scan OCR</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                {member.ocrConfidence || 95}% (Gemini Flash)
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Sinkronisasi Cloud</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 mt-0.5">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Google Sheets Terhubung
              </span>
            </div>
          </div>

          {/* KTP Photo & Data Inspection */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Foto KTP Preview (5 Cols) */}
            <div className="md:col-span-5 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-blue-500" />
                Berkas Foto e-KTP
              </span>
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 aspect-[16/10] flex items-center justify-center">
                {member.fotoKtpUrl ? (
                  <img
                    src={member.fotoKtpUrl}
                    alt={`KTP ${member.nama}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-500 text-xs text-center p-4">
                    Foto KTP tidak tersedia
                  </div>
                )}
              </div>

              {/* Google Drive Link */}
              <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs space-y-1">
                <div className="font-semibold text-blue-900 dark:text-blue-300 flex items-center justify-between">
                  <span>Penyimpanan Google Drive</span>
                  <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Foto tersimpan aman di Google Drive organisasi.
                </p>
                {member.driveFileUrl && (
                  <a
                    href={member.driveFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1"
                  >
                    <span>Buka Berkas Asli di Google Drive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Extracted Details Table (7 Cols) */}
            <div className="md:col-span-7 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-500" />
                Rincian Identitas Kependudukan
              </span>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                <div className="p-2.5 grid grid-cols-3 bg-slate-50/50 dark:bg-slate-800/30">
                  <span className="text-slate-400">Nama Lengkap</span>
                  <span className="col-span-2 font-bold text-slate-900 dark:text-slate-100">{member.nama}</span>
                </div>
                <div className="p-2.5 grid grid-cols-3">
                  <span className="text-slate-400">NIK e-KTP</span>
                  <span className="col-span-2 font-mono font-semibold text-slate-800 dark:text-slate-200">{member.nik}</span>
                </div>
                <div className="p-2.5 grid grid-cols-3 bg-slate-50/50 dark:bg-slate-800/30">
                  <span className="text-slate-400">Tempat, Tgl Lahir</span>
                  <span className="col-span-2 text-slate-800 dark:text-slate-200">{member.tempatTglLahir || '-'}</span>
                </div>
                <div className="p-2.5 grid grid-cols-3">
                  <span className="text-slate-400">Jenis Kelamin</span>
                  <span className="col-span-2 text-slate-800 dark:text-slate-200">{member.jenisKelamin || '-'}</span>
                </div>
                <div className="p-2.5 grid grid-cols-3 bg-slate-50/50 dark:bg-slate-800/30">
                  <span className="text-slate-400">Alamat Domisili</span>
                  <span className="col-span-2 text-slate-800 dark:text-slate-200 leading-relaxed">{member.alamat}</span>
                </div>
                <div className="p-2.5 grid grid-cols-3">
                  <span className="text-slate-400">Jabatan / Divisi</span>
                  <span className="col-span-2 font-semibold text-blue-600 dark:text-blue-400">
                    {member.jabatan || member.departemen || 'Anggota'}
                  </span>
                </div>
                <div className="p-2.5 grid grid-cols-3">
                  <span className="text-slate-400">Kontak WhatsApp</span>
                  <span className="col-span-2 text-slate-800 dark:text-slate-200">{member.telepon || '-'}</span>
                </div>
                <div className="p-2.5 grid grid-cols-3 bg-slate-50/50 dark:bg-slate-800/30">
                  <span className="text-slate-400">Email</span>
                  <span className="col-span-2 text-slate-800 dark:text-slate-200">{member.email || '-'}</span>
                </div>
                <div className="p-2.5 grid grid-cols-3">
                  <span className="text-slate-400">Verifikator</span>
                  <span className="col-span-2 text-slate-800 dark:text-slate-200">{member.verifiedBy || 'Belum diverifikasi'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification / Edit Action Section */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as MemberStatus)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pending Verifikasi">Pending Verifikasi</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                  <option value="Ditangguhkan">Ditangguhkan</option>
                </select>
                <button
                  onClick={handleSaveStatus}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
                >
                  Simpan Status
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-slate-500 text-xs hover:text-slate-700"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Ubah Status
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDeleteMember}
                disabled={isDeleting}
                className="px-3.5 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Hapus data anggota dari database"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>{isDeleting ? 'Menghapus...' : 'Hapus Anggota'}</span>
              </button>

              {member.status === 'Pending Verifikasi' && (
                <button
                  onClick={handleVerify}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Verifikasi KTP Sekarang
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        title="Hapus Data Anggota"
        itemTitle={member.nama}
        itemSubtitle={`NIK: ${member.nik}`}
        itemBadge={member.jabatan || 'Anggota'}
        itemBadgeColor="blue"
        description={`Apakah Anda yakin ingin menghapus data anggota "${member.nama}"? Tindakan ini akan menghapus data secara permanen dari basis data dan arsip keanggotaan.`}
        isLoading={isDeleting}
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            await deleteMember(member.id);
            setShowDeleteModal(false);
            onClose();
          } finally {
            setIsDeleting(false);
          }
        }}
        onCancel={() => {
          if (!isDeleting) setShowDeleteModal(false);
        }}
      />
    </div>
  );
};
