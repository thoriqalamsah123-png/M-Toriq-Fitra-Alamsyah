import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { MemberTable } from './components/MemberTable';
import { MemberRegistrationForm } from './components/MemberRegistrationForm';
import { MemberDetailModal } from './components/MemberDetailModal';
import { GoogleWorkspaceModal } from './components/GoogleWorkspaceModal';
import { TwoFactorAuthModal } from './components/TwoFactorAuthModal';
import { ExternalApiModal } from './components/ExternalApiModal';
import { BackupModal } from './components/BackupModal';
import { LoginPage } from './components/LoginPage';
import { LettersPage } from './components/LettersPage';
import { AccountSettings } from './components/AccountSettings';
import { Member, UserRole } from './types';
import {
  Cloud,
  FileSpreadsheet,
  HardDrive,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Key,
  Users,
  Database,
  Download,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { exportMembersToExcel, exportMembersToPdf } from './services/exportService';

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    members,
    workspaceConfig,
    currentUser,
    switchRole,
    isAuthenticated,
    setWorkspaceModalOpen,
    setTwoFactorModalOpen,
    setBackupModalOpen,
    syncAllToGoogleSheets,
  } = useApp();

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Protected route guard: If not logged in, show secure login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await syncAllToGoogleSheets();
    } finally {
      setIsSyncing(false);
    }
  };

  const allRoles: UserRole[] = [
    'Super Admin',
    'Admin Verifikator',
    'Pengurus / Operator',
    'Auditor / Viewer',
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && <AnalyticsDashboard />}

          {activeTab === 'members' && (
            <MemberTable onSelectMember={(m) => setSelectedMember(m)} />
          )}

          {activeTab === 'registration' && <MemberRegistrationForm />}

          {activeTab === 'letters' && <LettersPage />}

          {/* Google Workspace Tab View */}
          {activeTab === 'workspace' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Integrasi Google Workspace Terpadu
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Database anggota tersinkronisasi langsung ke Google Sheets & arsip foto KTP ke Google Drive
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Google Sheets Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">
                          Google Sheets Master
                        </h3>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          Terkoneksi & Siap Sinkron
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200">
                      {members.length} Baris
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Setiap anggota yang terdaftar secara otomatis ditambahkan sebagai baris baru dengan rincian NIK, nama lengkap, jabatan, status keanggotaan, dan tautan berkas foto KTP.
                  </p>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={handleSyncNow}
                      disabled={isSyncing}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
                    </button>
                    {workspaceConfig.spreadsheetUrl && (
                      <a
                        href={workspaceConfig.spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                      >
                        <span>Buka Spreadsheet</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Google Drive Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <HardDrive className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">
                          Penyimpanan Google Drive
                        </h3>
                        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                          Folder Terenkripsi Aktif
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200">
                      Folder KTP
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Hasil unggahan foto e-KTP langsung diunggah ke Google Drive organisasi melalui API, menghasilkan tautan penampil yang aman dan dapat diverifikasi kapan saja.
                  </p>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => setWorkspaceModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <span>Konfigurasi Folder Drive</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security & 2FA Tab View */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Manajemen Hak Akses Berbasis Peran & Keamanan 2FA
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Autentikasi token JWT, proteksi TOTP, dan pembagian tugas operasional organisasi
                </p>
              </div>

              {/* Roles Table */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Tingkatan Peran Pengguna (Role-Based Access Control)
                  </span>
                  <button
                    onClick={() => setTwoFactorModalOpen(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Kelola 2FA
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {allRoles.map((role) => {
                    const isSelected = currentUser.role === role;
                    return (
                      <div
                        key={role}
                        onClick={() => switchRole(role)}
                        className={`cursor-pointer p-4 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {role}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                          {role === 'Super Admin' && 'Akses penuh ke semua modul, hapus data, sinkronisasi pusat, & 2FA.'}
                          {role === 'Admin Verifikator' && 'Izin verifikasi KTP, persetujuan status keanggotaan, & ekspor data.'}
                          {role === 'Pengurus / Operator' && 'Pendaftaran anggota baru, pemindaian OCR KTP, & pembaruan kontak.'}
                          {role === 'Auditor / Viewer' && 'Akses hanya-lihat (read-only) untuk evaluasi dan audit laporan.'}
                        </p>
                        <span className="mt-3 block text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                          {isSelected ? 'Peran Aktif Saat Ini' : 'Klik untuk Beralih'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Account Credentials Settings */}
              <AccountSettings />
            </div>
          )}

          {/* Backup & Export Tab View */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Pencadangan Cloud & Ekspor Laporan Resmi
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Arsip komprehensif data organisasi dan generator laporan PDF & Excel untuk manajemen
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Buku Induk Anggota (Format Excel .xlsx)
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Menghasilkan file lembar kerja Excel berisi metadata lengkap, nomor NIK, jabatan, status keanggotaan, riwayat OCR, dan lembar rekapitulasi eksekutif.
                  </p>
                  <button
                    onClick={() => exportMembersToExcel(members)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Unduh File Excel
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Laporan Resmi Manajemen (Format PDF)
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Dokumen resmi berformat landscape dengan kop surat organisasi, tanggal pencetakan, ringkasan jumlah anggota aktif, dan tabel rekapitulasi terverifikasi.
                  </p>
                  <button
                    onClick={() => exportMembersToPdf(members)}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Cetak Dokumen PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <MemberDetailModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
      <GoogleWorkspaceModal />
      <TwoFactorAuthModal />
      <ExternalApiModal />
      <BackupModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
