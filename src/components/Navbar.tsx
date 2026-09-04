import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  Bell,
  Sun,
  Moon,
  Globe,
  ShieldCheck,
  Radio,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Cloud,
  ChevronDown,
  User,
  LogOut,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    darkMode,
    toggleDarkMode,
    currentUser,
    switchRole,
    logout,
    workspaceConfig,
    notifications,
    unreadNotificationsCount,
    markAllNotificationsRead,
    clearNotifications,
    wsConnected,
    setTwoFactorModalOpen,
    setWorkspaceModalOpen,
    setExternalApiModalOpen,
    syncAllToGoogleSheets,
  } = useApp();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSyncSheets = async () => {
    setIsSyncing(true);
    try {
      await syncAllToGoogleSheets();
    } finally {
      setIsSyncing(false);
    }
  };

  const roles: UserRole[] = ['Super Admin', 'Admin Verifikator', 'Pengurus / Operator', 'Auditor / Viewer'];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Organization Brand & Live WS Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {t.appTitle}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                v2.6 Enterprise
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {wsConnected ? 'Real-Time Sync Aktif' : 'Reconnecting...'}
              </span>
              <span>•</span>
              <span className="hidden md:inline">{t.appSubtitle}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2">
          {/* Quick Google Sheets Sync button */}
          <button
            id="navbar-sync-sheets-btn"
            onClick={handleSyncSheets}
            disabled={isSyncing}
            title="Sinkronkan data dengan Google Sheets"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Google Sheets</span>
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>

          {/* Google Workspace status indicator */}
          <button
            id="navbar-workspace-btn"
            onClick={() => setWorkspaceModalOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <Cloud className="w-3.5 h-3.5 text-blue-500" />
            <span>Workspace</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </button>

          {/* 2FA Status Shortcut */}
          <button
            id="navbar-2fa-btn"
            onClick={() => setTwoFactorModalOpen(true)}
            title="Pengaturan Autentikasi Dua Faktor (2FA)"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline font-medium">2FA</span>
          </button>

          {/* Language Switcher */}
          <button
            id="navbar-lang-toggle"
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            title="Ganti Bahasa / Change Language"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-wider">{language}</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            id="navbar-dark-mode-toggle"
            onClick={toggleDarkMode}
            title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              id="navbar-notif-btn"
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white bg-red-600 rounded-full flex items-center justify-center animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {t.notifications.title}
                    </span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-medium">
                      {notifications.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {t.notifications.markAllRead}
                    </button>
                    <button
                      onClick={clearNotifications}
                      className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Bersihkan
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      {t.notifications.empty}
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          !n.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {n.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          ) : n.type === 'warning' ? (
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <Radio className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {n.title}
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                              {new Date(n.timestamp).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative ml-1" ref={roleRef}>
            <button
              id="navbar-profile-role-btn"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-none">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] font-medium text-blue-600 dark:text-blue-400 leading-none mt-1">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    <span>JWT Token & 2FA Terverifikasi</span>
                  </div>
                </div>

                <div className="px-2 py-1">
                  <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t.auth.switchRole}
                  </span>
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors ${
                        currentUser.role === r
                          ? 'bg-blue-50 dark:bg-blue-950/60 font-semibold text-blue-700 dark:text-blue-300'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{r}</span>
                      {currentUser.role === r && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>

                <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 px-2">
                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar Sistem (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
