import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Key,
  Copy,
  Check,
  Smartphone,
  Lock,
  RefreshCw,
  AlertCircle,
  QrCode,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateTotpCode, get2FaBackupCodes } from '../services/authService';

export const TwoFactorAuthModal: React.FC = () => {
  const { twoFactorModalOpen, setTwoFactorModalOpen, currentUser, addNotification } = useApp();

  const [secret] = useState('JBSWY3DPEHPK3PXP');
  const [totpCode, setTotpCode] = useState('------');
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const backupCodes = get2FaBackupCodes();

  // Timer loop for rotating 30s TOTP code
  useEffect(() => {
    function updateCode() {
      const sec = 30 - (Math.floor(Date.now() / 1000) % 30);
      setSecondsRemaining(sec);
      setTotpCode(generateTotpCode(secret));
    }

    updateCode();
    const interval = setInterval(updateCode, 1000);
    return () => clearInterval(interval);
  }, [secret]);

  if (!twoFactorModalOpen) return null;

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleVerifyTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (testInput.trim() === totpCode || backupCodes.includes(testInput.trim())) {
      setVerifyStatus('success');
      addNotification({
        title: '2FA Terverifikasi',
        message: 'Kode TOTP Authenticator valid dan berhasil disetujui.',
        type: 'success',
      });
    } else {
      setVerifyStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Keamanan Autentikasi Dua Faktor (2FA)
              </h3>
              <p className="text-xs text-slate-500">
                Lindungi akses data sensitif anggota dan otentikasi peran
              </p>
            </div>
          </div>
          <button
            onClick={() => setTwoFactorModalOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Active 2FA Status Card */}
          <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-indigo-950 dark:text-indigo-200 block text-xs">
                  Status 2FA: Aktif ({currentUser.role})
                </span>
                <span className="text-[11px] text-indigo-700 dark:text-indigo-400">
                  Menggunakan standar RFC 6238 TOTP (Google Authenticator, Authy, dll.)
                </span>
              </div>
            </div>
          </div>

          {/* Live TOTP Code Visualizer */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-center space-y-2">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              Kode Verifikasi Saat Ini (Berubah Otomatis)
            </span>
            <div className="font-mono text-3xl font-extrabold tracking-widest text-slate-900 dark:text-slate-100 py-1">
              {totpCode.slice(0, 3)} {totpCode.slice(3)}
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-500 text-[11px]">
              <div className="w-3 h-3 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <span>Berganti dalam <strong>{secondsRemaining} detik</strong></span>
            </div>
          </div>

          {/* Secret Key & QR info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-500" />
                Kunci Rahasia (Secret Key)
              </span>
              <button
                onClick={handleCopySecret}
                className="text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold hover:underline flex items-center gap-1"
              >
                {copiedSecret ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSecret ? 'Tersalin' : 'Salin Kunci'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>{secret}</span>
              <span className="text-[10px] text-slate-400">Base32</span>
            </div>
          </div>

          {/* Backup Recovery Codes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100">
                Kode Cadangan Pemulihan (Backup Codes)
              </span>
              <button
                onClick={handleCopyBackupCodes}
                className="text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold hover:underline flex items-center gap-1"
              >
                {copiedCodes ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCodes ? 'Semua Tersalin' : 'Salin Kode Cadangan'}</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {backupCodes.map((code) => (
                <span
                  key={code}
                  className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-center text-slate-700 dark:text-slate-300 font-medium"
                >
                  {code}
                </span>
              ))}
            </div>
          </div>

          {/* Test Validation Input */}
          <form onSubmit={handleVerifyTest} className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <label className="block font-semibold text-slate-800 dark:text-slate-200">
              Uji Coba Verifikasi Kode TOTP
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={testInput}
                onChange={(e) => {
                  setTestInput(e.target.value);
                  setVerifyStatus('idle');
                }}
                placeholder="Masukkan 6 digit kode"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
              >
                Validasi
              </button>
            </div>

            {verifyStatus === 'success' && (
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                <Check className="w-3.5 h-3.5" />
                Kode 2FA valid! Akses disetujui.
              </p>
            )}
            {verifyStatus === 'error' && (
              <p className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-1 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" />
                Kode tidak sesuai atau sudah kedaluwarsa.
              </p>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setTwoFactorModalOpen(false)}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
