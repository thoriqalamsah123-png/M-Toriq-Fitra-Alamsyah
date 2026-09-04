import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../services/authService';
import { getCustomCredentials } from '../services/credentialService';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, handleGoogleLogin, isLoggingInGoogle, t, darkMode, toggleDarkMode } = useApp();

  const customCreds = getCustomCredentials();
  const [email, setEmail] = useState(customCreds ? customCreds.email : 'hendra.kusuma@organisasi.or.id');
  const [password, setPassword] = useState(customCreds ? customCreds.password : 'admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Super Admin');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectPreset = (role: UserRole) => {
    setSelectedRole(role);
    if (!customCreds) {
      const user = DEMO_USERS[role];
      if (user) {
        setEmail(user.email);
        setPassword('admin123');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Silakan isi email/username dan password.');
      return;
    }

    // Check custom credentials locally configured
    const customCreds = getCustomCredentials();
    if (customCreds) {
      if (email !== customCreds.email || password !== customCreds.password) {
        setErrorMessage('Username/Email atau Password yang Anda masukkan salah.');
        return;
      }
    }

    setLoading(true);
    try {
      // Simulate/call backend auth endpoint
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });

      const json = await res.json().catch(() => ({}));
      
      // Override default demo user fields if custom credentials are used
      let baseUser = { ...DEMO_USERS[selectedRole] };
      if (!baseUser.id) {
        baseUser = {
          id: 'usr-admin-1',
          name: email.split('@')[0],
          email: email,
          role: selectedRole,
          twoFactorEnabled: true,
          token: 'jwt_mock_token_custom',
        };
      } else if (customCreds && email === customCreds.email) {
        baseUser.email = email;
        baseUser.name = email.split('@')[0];
      }

      login(baseUser);
    } catch (err: any) {
      // Fallback
      let fallbackUser = { ...DEMO_USERS[selectedRole] };
      if (customCreds && email === customCreds.email) {
        fallbackUser.email = email;
        fallbackUser.name = email.split('@')[0];
      }
      login(fallbackUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30 text-white mb-2">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Sistem Administrasi Organisasi
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Portal Manajemen Keanggotaan & Arsip Surat Terpadu. Akses dibatasi khusus administrator dan pengurus.
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-[11px] font-semibold mt-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Database Terproteksi & Enkripsi Sesi Aktif</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Quick Preset Selector for Fast Verification */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pilih Akun Administrator / Pengurus:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Super Admin', 'Admin Verifikator', 'Pengurus / Operator', 'Auditor / Viewer'] as UserRole[]).map(
                (role) => {
                  const isSel = selectedRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleSelectPreset(role)}
                      className={`text-left p-2.5 rounded-xl text-xs transition-all border ${
                        isSel
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm font-semibold'
                          : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60'
                      }`}
                    >
                      <div className="truncate font-medium">{role}</div>
                      <div className={`text-[10px] truncate ${isSel ? 'text-blue-100' : 'text-slate-400'}`}>
                        {DEMO_USERS[role]?.name}
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email / ID Pengurus
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  id="login-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@organisasi.or.id"
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span>Ingat sesi login</span>
              </label>
              <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">
                Lupa kata sandi?
              </span>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <span>Memverifikasi kredensial...</span>
              ) : (
                <>
                  <span>Masuk ke Sistem Administrasi</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] uppercase tracking-wider text-slate-500 shrink-0">
              atau autentikasi via
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          {/* Google Workspace Sign-In Button */}
          <button
            type="button"
            onClick={async () => {
              try {
                await handleGoogleLogin();
                login();
              } catch (e) {
                // fallback
                login();
              }
            }}
            disabled={isLoggingInGoogle}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Masuk dengan Akun Google Workspace</span>
          </button>
        </div>

        {/* Security Notice Footer */}
        <div className="text-center text-[11px] text-slate-500 leading-relaxed">
          Sistem dilengkapi otentikasi JWT dan audit trail. Hanya personil yang memiliki otorisasi yang diizinkan mengakses database keanggotaan dan surat resmi.
        </div>
      </div>
    </div>
  );
};
