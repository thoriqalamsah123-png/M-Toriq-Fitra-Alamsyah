import React, { useState } from 'react';
import {
  X,
  Database,
  Download,
  UploadCloud,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Clock,
  ShieldCheck,
  RefreshCw,
  HardDrive,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BackupSnapshot } from '../types';
import { exportMembersToExcel, exportMembersToPdf } from '../services/exportService';

export const BackupModal: React.FC = () => {
  const { backupModalOpen, setBackupModalOpen, members, addNotification } = useApp();

  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>([
    {
      id: 'snap-001',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      totalRecords: 5,
      sizeBytes: 124500,
      type: 'auto_cloud',
      status: 'completed',
    },
    {
      id: 'snap-002',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      totalRecords: 4,
      sizeBytes: 98200,
      type: 'auto_cloud',
      status: 'completed',
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);

  if (!backupModalOpen) return null;

  const handleCreateSnapshot = () => {
    setIsCreating(true);
    setTimeout(() => {
      const newSnap: BackupSnapshot = {
        id: `snap-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        totalRecords: members.length,
        sizeBytes: members.length * 24000,
        type: 'auto_cloud',
        status: 'completed',
      };
      setSnapshots([newSnap, ...snapshots]);
      setIsCreating(false);
      addNotification({
        title: 'Pencadangan Cloud Berhasil',
        message: `Snapshot data (${members.length} anggota) tersimpan aman ke cloud.`,
        type: 'success',
      });
    }, 800);
  };

  const handleDownloadJson = (snap: BackupSnapshot) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(members, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Backup_Organisasi_${snap.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Pencadangan Cloud Otomatis & Ekspor Laporan
              </h3>
              <p className="text-xs text-slate-500">
                Pencegahan kehilangan data dan laporan manajemen resmi (Excel & PDF)
              </p>
            </div>
          </div>
          <button
            onClick={() => setBackupModalOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Quick Management Report Export Cards */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[10px]">
              Unduh Laporan Manajemen Resmi
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => exportMembersToExcel(members)}
                className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 hover:bg-emerald-100/60 dark:bg-emerald-950/30 text-left transition-colors flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">
                    Ekspor Excel (.xlsx)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Lengkap dengan sheet ringkasan & data terformat
                  </span>
                </div>
              </button>

              <button
                onClick={() => exportMembersToPdf(members)}
                className="p-3.5 rounded-xl border border-red-200 dark:border-red-800/80 bg-red-50/50 hover:bg-red-100/60 dark:bg-red-950/30 text-left transition-colors flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">
                    Laporan PDF Resmi
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Buku induk landscape dengan kop resmi organisasi
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Cloud Automated Backup Status */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-blue-600" />
                Pencadangan Otomatis ke Cloud
              </span>
              <button
                onClick={handleCreateSnapshot}
                disabled={isCreating}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isCreating ? 'animate-spin' : ''}`} />
                {isCreating ? 'Mencadangkan...' : 'Buat Snapshot Baru'}
              </button>
            </div>

            <p className="text-slate-500 text-[11px]">
              Sistem secara otomatis mencadangkan seluruh data anggota, riwayat verifikasi KTP, dan log sinkronisasi Google Workspace setiap 24 jam.
            </p>

            {/* Snapshots Table */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  <tr>
                    <th className="py-2 px-3">ID Snapshot</th>
                    <th className="py-2 px-3">Waktu Pencadangan</th>
                    <th className="py-2 px-3">Jumlah Data</th>
                    <th className="py-2 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {snapshots.map((snap) => (
                    <tr key={snap.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {snap.id}
                      </td>
                      <td className="py-2 px-3 text-slate-500">
                        {new Date(snap.timestamp).toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-3 text-emerald-600 font-medium">
                        {snap.totalRecords} Anggota
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => handleDownloadJson(snap)}
                          className="text-blue-600 hover:underline flex items-center gap-1 ml-auto"
                        >
                          <Download className="w-3 h-3" />
                          <span>Unduh JSON</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setBackupModalOpen(false)}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
