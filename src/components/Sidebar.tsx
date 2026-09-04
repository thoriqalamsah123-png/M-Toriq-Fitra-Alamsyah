import React from 'react';
import {
  LayoutDashboard,
  Users,
  ScanLine,
  FileSpreadsheet,
  ShieldCheck,
  Database,
  CloudCheck,
  CheckCircle2,
  HardDrive,
  Share2,
  Mail,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    t,
    activeTab,
    setActiveTab,
    members,
    letters,
    workspaceConfig,
    setWorkspaceModalOpen,
    setTwoFactorModalOpen,
    setExternalApiModalOpen,
    setBackupModalOpen,
  } = useApp();

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'members', label: t.nav.members, icon: Users, badge: members.length },
    { id: 'registration', label: t.nav.registration, icon: ScanLine },
    { id: 'letters', label: t.nav.letters, icon: Mail, badge: letters.length },
    { id: 'workspace', label: t.nav.workspace, icon: FileSpreadsheet },
    { id: 'security', label: t.nav.security, icon: ShieldCheck },
    { id: 'backup', label: t.nav.backup, icon: Database },
  ] as const;

  const syncedCount = members.filter((m) => m.syncStatus === 'synced').length;
  const syncPercentage = members.length > 0 ? Math.round((syncedCount / members.length) * 100) : 100;

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shrink-0 transition-colors">
      <div className="space-y-6">
        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {'badge' in item && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Integration Quick Status Cards */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Status Sinkronisasi
          </div>

          {/* Google Sheets Sync Card */}
          <div
            onClick={() => setWorkspaceModalOpen(true)}
            className="cursor-pointer p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-all text-xs"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Google Sheets
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {syncPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${syncPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 truncate">
              {syncedCount} dari {members.length} anggota tersinkron
            </p>
          </div>

          {/* Google Drive KTP Storage Card */}
          <div
            onClick={() => setWorkspaceModalOpen(true)}
            className="cursor-pointer p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-all text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-blue-500" />
                Google Drive KTP
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium">
                Cloud
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              Folder: {workspaceConfig.driveFolderName}
            </p>
          </div>

          {/* External API / 3rd Party Webhook Simulator */}
          <button
            onClick={() => setExternalApiModalOpen(true)}
            className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between text-slate-700 dark:text-slate-300 transition-all"
          >
            <span className="flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>API Pihak Ketiga</span>
            </span>
            <span className="text-[10px] text-slate-400">Dukcapil/SIAK</span>
          </button>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
        <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Gemini 2.5/3.6 Flash Engine Active</span>
        </div>
      </div>
    </aside>
  );
};
