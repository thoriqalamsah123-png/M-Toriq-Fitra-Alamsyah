import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  HardDrive,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Cloud,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GoogleWorkspaceModal: React.FC = () => {
  const {
    t,
    workspaceModalOpen,
    setWorkspaceModalOpen,
    workspaceConfig,
    updateWorkspaceConfig,
    members,
    syncAllToGoogleSheets,
    googleUser,
    isLoggingInGoogle,
    handleGoogleLogin,
    handleGoogleLogout,
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [sheetName, setSheetName] = useState(workspaceConfig.sheetName);
  const [folderName, setFolderName] = useState(workspaceConfig.driveFolderName);
  const [confirmSyncOpen, setConfirmSyncOpen] = useState(false);

  if (!workspaceModalOpen) return null;

  const executeSync = async () => {
    setConfirmSyncOpen(false);
    setIsSyncing(true);
    try {
      await syncAllToGoogleSheets();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveConfig = () => {
    updateWorkspaceConfig({
      sheetName,
      driveFolderName: folderName,
    });
    alert('Konfigurasi Google Workspace berhasil disimpan.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t.workspace.title}
              </h3>
              <p className="text-xs text-slate-500">{t.workspace.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setWorkspaceModalOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Connection Status Card */}
          {googleUser ? (
            <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {googleUser.photoURL ? (
                  <img
                    src={googleUser.photoURL}
                    alt={googleUser.displayName || 'Google User'}
                    className="w-10 h-10 rounded-full border border-emerald-300 dark:border-emerald-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 block text-xs">
                    {googleUser.displayName || 'Akun Google Terhubung'} ({googleUser.email})
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Google Sheets & Google Drive API: Terautentikasi Aktif
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                  Terverifikasi
                </span>
                <button
                  onClick={handleGoogleLogout}
                  title="Putuskan akun Google"
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white/80 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-blue-950 dark:text-blue-200 text-xs">
                    Hubungkan Google Workspace Resmi
                  </span>
                </div>
                <p className="text-[11px] text-blue-700 dark:text-blue-300">
                  Masuk dengan akun Google Anda untuk menyinkronkan data anggota langsung ke spreadsheet dan folder Google Drive akun Anda.
                </p>
              </div>

              {/* Official Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoggingInGoogle}
                className="inline-flex items-center gap-2.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl shadow-xs font-semibold text-xs transition-colors shrink-0 disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{isLoggingInGoogle ? 'Menghubungkan...' : 'Sign in with Google'}</span>
              </button>
            </div>
          )}

          {/* Google Sheets Config */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                {t.workspace.sheetConfig}
              </span>
              {workspaceConfig.spreadsheetUrl && (
                <a
                  href={workspaceConfig.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>{t.workspace.openSpreadsheet}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 mb-1">Nama Lembar Kerja</label>
                <input
                  type="text"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Spreadsheet ID</label>
                <input
                  type="text"
                  readOnly
                  value={workspaceConfig.spreadsheetId || 'Otomatis dibuat saat sinkronisasi'}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">
                Total baris data: <strong>{members.length} anggota</strong>
              </span>
              <span className="text-[11px] text-slate-400">
                Terakhir disinkron: {new Date(workspaceConfig.lastSyncTime || Date.now()).toLocaleTimeString('id-ID')}
              </span>
            </div>
          </div>

          {/* Google Drive Config */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-500" />
                {t.workspace.driveConfig}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Penyimpanan Berkas e-KTP
              </span>
            </div>

            <div>
              <label className="block text-slate-500 mb-1">{t.workspace.driveFolderName}</label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Setiap foto e-KTP hasil scan OCR diarsipkan secara terenkripsi ke Google Drive organisasi untuk kebutuhan arsip dan validasi data.
            </p>
          </div>

          {/* Auto-Sync Toggle */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                {t.workspace.autoSyncToggle}
              </span>
              <span className="text-[11px] text-slate-500">
                Kirim data baru secara otomatis ke Google Sheets begitu formulir disubmit
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={workspaceConfig.autoSync}
                onChange={(e) => updateWorkspaceConfig({ autoSync: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleSaveConfig}
            className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
          >
            Simpan Konfigurasi
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmSyncOpen(true)}
              disabled={isSyncing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : t.workspace.syncNow}</span>
            </button>
            <button
              onClick={() => setWorkspaceModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Explicit User Confirmation Modal for Workspace Data Update */}
      {confirmSyncOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Konfirmasi Sinkronisasi Google Sheets
                </h4>
                <p className="text-xs text-slate-500">Operasi pembaruan data eksternal</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Anda akan memperbarui dan menyinkronkan sebanyak <strong>{members.length} baris data anggota</strong> ke lembar kerja Google Sheets{' '}
              {workspaceConfig.spreadsheetUrl ? (
                <span className="font-mono text-[11px] text-blue-600">({workspaceConfig.spreadsheetId?.slice(0, 16)}...)</span>
              ) : (
                'organisasi'
              )}. Lanjutkan operasi ini?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmSyncOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeSync}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                Ya, Sinkronkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
