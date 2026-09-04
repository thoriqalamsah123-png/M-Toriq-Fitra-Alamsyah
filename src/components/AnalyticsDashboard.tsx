import React from 'react';
import {
  Users,
  UserCheck,
  Clock,
  FileSpreadsheet,
  TrendingUp,
  Sparkles,
  Download,
  ScanLine,
  RefreshCw,
  Award,
  CheckCircle2,
  Mail,
  Inbox,
  Send,
  ArrowRight,
  Paperclip,
  FileText,
  File,
  Image,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { exportMembersToExcel, exportMembersToPdf } from '../services/exportService';
import {
  exportLettersToExcel,
  exportLettersToPdf,
  exportLettersToWord,
  exportLettersToJpg,
} from '../services/letterExportService';

export const AnalyticsDashboard: React.FC = () => {
  const { t, members, letters, setActiveTab, syncAllToGoogleSheets } = useApp();

  // Aggregate metrics
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'Aktif').length;
  const pendingMembers = members.filter((m) => m.status === 'Pending Verifikasi').length;
  const syncedMembers = members.filter((m) => m.syncStatus === 'synced').length;

  const syncRate = totalMembers > 0 ? Math.round((syncedMembers / totalMembers) * 100) : 100;

  // Letters metrics & filter state
  const [letterFilter, setLetterFilter] = React.useState<'ALL' | 'Surat Masuk' | 'Surat Keluar'>('ALL');
  const totalLetters = letters.length;
  const incomingLetters = letters.filter((l) => l.type === 'Surat Masuk').length;
  const outgoingLetters = letters.filter((l) => l.type === 'Surat Keluar').length;

  const filteredLetters = React.useMemo(() => {
    let list = [...letters];
    if (letterFilter !== 'ALL') {
      list = list.filter((l) => l.type === letterFilter);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [letters, letterFilter]);

  const recentLetters = filteredLetters.slice(0, 6);

  // Monthly registrations trend data
  const monthlyTrendData = [
    { bulan: 'Apr', pendaftaran: 14, verifikasi: 14 },
    { bulan: 'Mei', pendaftaran: 22, verifikasi: 20 },
    { bulan: 'Jun', pendaftaran: 35, verifikasi: 32 },
    { bulan: 'Jul', pendaftaran: 48, verifikasi: 45 },
    { bulan: 'Agu', pendaftaran: 62, verifikasi: 59 },
    { bulan: 'Sep', pendaftaran: totalMembers + 18, verifikasi: activeMembers + 15 },
  ];

  // Department distribution
  const deptCountMap: Record<string, number> = {};
  members.forEach((m) => {
    const dept = m.departemen || 'Umum';
    deptCountMap[dept] = (deptCountMap[dept] || 0) + 1;
  });

  const departmentData = Object.keys(deptCountMap).map((key) => ({
    departemen: key.replace('Divisi ', '').substring(0, 16),
    jumlah: deptCountMap[key],
  }));

  // Status breakdown
  const statusData = [
    { name: 'Aktif', value: activeMembers || 1, color: '#10B981' },
    { name: 'Pending', value: pendingMembers || 1, color: '#F59E0B' },
    {
      name: 'Lainnya',
      value: totalMembers - activeMembers - pendingMembers || 1,
      color: '#94A3B8',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t.dashboard.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.dashboard.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('registration')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 flex items-center gap-1.5 transition-colors"
          >
            <ScanLine className="w-4 h-4" />
            <span>{t.dashboard.scanKtpNow}</span>
          </button>
          <button
            onClick={() => exportMembersToExcel(members)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{t.dashboard.exportExcel}</span>
          </button>
          <button
            onClick={() => exportMembersToPdf(members)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-red-600" />
            <span>{t.dashboard.exportPdf}</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.dashboard.totalMembers}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {totalMembers}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18% dari bulan lalu</span>
          </div>
        </div>

        {/* Active Verified Members */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.dashboard.activeMembers}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {activeMembers}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Status keanggotaan aktif
          </div>
        </div>

        {/* Pending Verification */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.dashboard.pendingVerification}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {pendingMembers}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
            Menunggu verifikasi admin
          </div>
        </div>

        {/* Google Sheets Sync Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.dashboard.syncedSheets}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {syncRate}%
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Otomatis tersinkronisasi</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend Area Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {t.dashboard.monthlyGrowth}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tren akumulasi pendaftaran anggota dan verifikasi OCR
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              6 Bulan Terakhir
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPendaftaran" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorVerifikasi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area
                  type="monotone"
                  dataKey="pendaftaran"
                  name="Pendaftaran Baru"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPendaftaran)"
                />
                <Area
                  type="monotone"
                  dataKey="verifikasi"
                  name="Terverifikasi KTP"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVerifikasi)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Pie Chart (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {t.dashboard.statusOverview}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Komposisi status keanggotaan saat ini
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
            <div>
              <span className="block text-[10px] text-slate-400">Aktif</span>
              <strong className="text-emerald-600 dark:text-emerald-400">{activeMembers}</strong>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Pending</span>
              <strong className="text-amber-600 dark:text-amber-400">{pendingMembers}</strong>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Lainnya</span>
              <strong className="text-slate-600 dark:text-slate-400">
                {totalMembers - activeMembers - pendingMembers}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Department Breakdown Bar Chart */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {t.dashboard.departmentDistribution}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribusi jumlah anggota aktif berdasarkan divisi & departemen
            </p>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="departemen" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '11px',
                  border: 'none',
                }}
              />
              <Bar dataKey="jumlah" name="Jumlah Anggota" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ringkasan & Ekspor Agenda Surat Masuk & Keluar di Dashboard */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>Agenda Surat Masuk & Keluar Organisasi</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pantau arus persuratan, disposisi, dan ekspor berkas langsung dari dashboard utama
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Direct Export Buttons from Dashboard */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => exportLettersToExcel(filteredLetters)}
                title="Ekspor ke Excel (.xlsx)"
                className="px-2 py-1 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>
              <button
                type="button"
                onClick={() => exportLettersToPdf(filteredLetters)}
                title="Ekspor ke PDF (.pdf)"
                className="px-2 py-1 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                type="button"
                onClick={() => exportLettersToWord(filteredLetters)}
                title="Ekspor ke Word (.doc)"
                className="px-2 py-1 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 transition-colors"
              >
                <File className="w-3.5 h-3.5" />
                <span>Word</span>
              </button>
              <button
                type="button"
                onClick={() => exportLettersToJpg(filteredLetters)}
                title="Ekspor ke Gambar (.jpg)"
                className="px-2 py-1 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 transition-colors"
              >
                <Image className="w-3.5 h-3.5" />
                <span>JPG</span>
              </button>
            </div>

            <button
              onClick={() => setActiveTab('letters')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 flex items-center gap-1 transition-colors"
            >
              <span>Buka Menu Persuratan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mini stats cards for letters */}
        <div className="grid grid-cols-3 gap-3">
          <div
            onClick={() => setLetterFilter('ALL')}
            className={`p-3 rounded-xl cursor-pointer transition-all border ${
              letterFilter === 'ALL'
                ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 ring-2 ring-blue-500/20'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span className="font-medium">Total Surat</span>
              <Mail className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalLetters}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Tampilkan Semua</div>
          </div>

          <div
            onClick={() => setLetterFilter('Surat Masuk')}
            className={`p-3 rounded-xl cursor-pointer transition-all border ${
              letterFilter === 'Surat Masuk'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/20'
                : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
            }`}
          >
            <div className="text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
              <span className="font-medium">Surat Masuk</span>
              <Inbox className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{incomingLetters}</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Filter Surat Masuk</div>
          </div>

          <div
            onClick={() => setLetterFilter('Surat Keluar')}
            className={`p-3 rounded-xl cursor-pointer transition-all border ${
              letterFilter === 'Surat Keluar'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 ring-2 ring-blue-500/20'
                : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/30'
            }`}
          >
            <div className="text-[11px] text-blue-700 dark:text-blue-300 flex items-center justify-between">
              <span className="font-medium">Surat Keluar</span>
              <Send className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1">{outgoingLetters}</div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Filter Surat Keluar</div>
          </div>
        </div>

        {/* Filter Pills & Letters Preview List */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Dokumen Persuratan Terkini ({filteredLetters.length} dokumen):
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setLetterFilter('ALL')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                  letterFilter === 'ALL'
                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setLetterFilter('Surat Masuk')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                  letterFilter === 'Surat Masuk'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Surat Masuk
              </button>
              <button
                type="button"
                onClick={() => setLetterFilter('Surat Keluar')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                  letterFilter === 'Surat Keluar'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Surat Keluar
              </button>
            </div>
          </div>

          {recentLetters.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              Belum ada arsip persuratan untuk kategori ini.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/40 dark:bg-slate-800/20">
              {recentLetters.map((l) => (
                <div
                  key={l.id}
                  onClick={() => setActiveTab('letters')}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-white dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                        l.type === 'Surat Masuk'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {l.type}
                    </span>

                    {l.sifat && l.sifat !== 'Biasa' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 shrink-0">
                        {l.sifat}
                      </span>
                    )}

                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {l.nomorSurat} — <span className="font-normal">{l.perihal}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                        <span>{l.type === 'Surat Masuk' ? `Dari: ${l.pengirim}` : `Tujuan: ${l.penerima}`}</span>
                        <span>•</span>
                        <span>Tgl: {l.tanggalSurat}</span>
                        {l.fileAttachment && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-blue-500 font-medium">
                              <Paperclip className="w-3 h-3" />
                              Lampiran: {l.fileAttachment.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {l.status}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
