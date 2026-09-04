import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Sparkles,
  ArrowUpDown,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Member, MemberRole, MemberStatus, SyncState } from '../types';
import { exportMembersToExcel, exportMembersToPdf } from '../services/exportService';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface MemberTableProps {
  onSelectMember: (member: Member) => void;
}

export const MemberTable: React.FC<MemberTableProps> = ({ onSelectMember }) => {
  const {
    t,
    members,
    loading,
    currentUser,
    verifyMemberKtp,
    deleteMember,
    deleteMultipleMembers,
    syncAllToGoogleSheets,
    setWorkspaceModalOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [syncFilter, setSyncFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'nik'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isSyncing, setIsSyncing] = useState(false);

  // Deletion modal states
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [isDeletingSingle, setIsDeletingSingle] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);

  // Role options
  const roles: MemberRole[] = [
    'Ketua Umum',
    'Wakil Ketua',
    'Sekretaris Jenderal',
    'Bendahara',
    'Kepala Divisi IT',
    'Kepala Divisi Humas',
    'Kepala Divisi Operasional',
    'Anggota Aktif',
    'Anggota Muda',
    'Dewan Pembina',
  ];

  // Filtered and sorted members
  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          m.nama.toLowerCase().includes(query) ||
          m.nik.toLowerCase().includes(query) ||
          m.alamat.toLowerCase().includes(query) ||
          m.jabatan.toLowerCase().includes(query) ||
          m.departemen.toLowerCase().includes(query);

        const matchesRole = roleFilter === 'ALL' || m.jabatan === roleFilter;
        const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
        const matchesSync = syncFilter === 'ALL' || m.syncStatus === syncFilter;

        return matchesSearch && matchesRole && matchesStatus && matchesSync;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'name') {
          comp = a.nama.localeCompare(b.nama);
        } else if (sortBy === 'nik') {
          comp = a.nik.localeCompare(b.nik);
        } else {
          comp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [members, searchQuery, roleFilter, statusFilter, syncFilter, sortBy, sortOrder]);

  const handleSyncSheets = async () => {
    setIsSyncing(true);
    try {
      await syncAllToGoogleSheets();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportExcel = () => {
    exportMembersToExcel(filteredMembers);
  };

  const handleExportPdf = () => {
    exportMembersToPdf(filteredMembers);
  };

  const isAllVisibleSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((m) => selectedMemberIds.includes(m.id));

  const handleToggleSelectAll = () => {
    if (isAllVisibleSelected) {
      const visibleIds = new Set(filteredMembers.map((m) => m.id));
      setSelectedMemberIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      const newIds = new Set([...selectedMemberIds, ...filteredMembers.map((m) => m.id)]);
      setSelectedMemberIds(Array.from(newIds));
    }
  };

  const handleToggleSelectMember = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteClick = (member: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(member);
  };

  const handleVerify = async (id: string) => {
    if (currentUser.role === 'Auditor / Viewer') {
      return;
    }
    await verifyMemberKtp(id);
  };

  return (
    <div className="space-y-4">
      {/* Table Top Controls & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              id="member-table-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.table.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons: Batch Delete, Sheets Sync, Excel, PDF */}
          <div className="flex items-center gap-2 flex-wrap">
            {selectedMemberIds.length > 0 && (
              <button
                id="member-table-batch-delete-btn"
                type="button"
                onClick={() => setShowBatchDeleteModal(true)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 shadow-sm transition-colors animate-in fade-in"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Terpilih ({selectedMemberIds.length})</span>
              </button>
            )}

            <button
              id="member-table-sync-sheets-btn"
              onClick={handleSyncSheets}
              disabled={isSyncing}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t.table.syncSheetsBtn}</span>
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>

            <button
              id="member-table-export-excel-btn"
              onClick={handleExportExcel}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel</span>
            </button>

            <button
              id="member-table-export-pdf-btn"
              onClick={handleExportPdf}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-red-600" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1 text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">{t.table.filterRole}</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">{t.table.filterStatus}</option>
            <option value="Aktif">Aktif</option>
            <option value="Pending Verifikasi">Pending Verifikasi</option>
            <option value="Non-Aktif">Non-Aktif</option>
            <option value="Ditangguhkan">Ditangguhkan</option>
          </select>

          {/* Sync Status Filter */}
          <select
            value={syncFilter}
            onChange={(e) => setSyncFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">{t.table.filterSync}</option>
            <option value="synced">Tersinkron Cloud</option>
            <option value="pending">Pending Sync</option>
            <option value="local_only">Lokal</option>
          </select>

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="ml-auto flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 rounded"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>{sortOrder === 'asc' ? 'Terlama' : 'Terbaru'}</span>
          </button>
        </div>
      </div>

      {/* Main Members Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    title="Pilih Semua Anggota"
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors inline-flex items-center justify-center"
                  >
                    {isAllVisibleSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">{t.table.columns.member}</th>
                <th className="py-3 px-4">{t.table.columns.nik}</th>
                <th className="py-3 px-4">{t.table.columns.roleDept}</th>
                <th className="py-3 px-4">{t.table.columns.address}</th>
                <th className="py-3 px-4">{t.table.columns.status}</th>
                <th className="py-3 px-4">{t.table.columns.sync}</th>
                <th className="py-3 px-4 text-right">{t.table.columns.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <p className="font-semibold text-sm">{t.table.noData}</p>
                    <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      selectedMemberIds.includes(member.id) ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    {/* Checkbox selector */}
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleToggleSelectMember(member.id, e)}
                        title={`Pilih ${member.nama}`}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors inline-flex items-center justify-center"
                      >
                        {selectedMemberIds.includes(member.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Member Name & Photo / Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {member.fotoKtpUrl ? (
                          <img
                            src={member.fotoKtpUrl}
                            alt={member.nama}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">
                            {member.nama.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                            onClick={() => onSelectMember(member)}
                          >
                            {member.nama}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <span>{member.telepon || member.email || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* NIK with OCR Confidence tag */}
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                        {member.nik}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                          {member.ocrConfidence || 95}% Akurasi
                        </span>
                      </div>
                    </td>

                    {/* Role & Department */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {member.jabatan}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {member.departemen}
                      </div>
                    </td>

                    {/* Address */}
                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="truncate text-slate-600 dark:text-slate-300" title={member.alamat}>
                        {member.alamat}
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          member.status === 'Aktif'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : member.status === 'Pending Verifikasi'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {member.status === 'Aktif' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-500" />
                        )}
                        {member.status}
                      </span>
                    </td>

                    {/* Cloud Sync Status */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                            member.syncStatus === 'synced'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          <FileSpreadsheet className="w-3 h-3" />
                          {member.syncStatus === 'synced' ? 'Sheets Ok' : 'Pending'}
                        </span>
                        {member.driveFileUrl && (
                          <a
                            href={member.driveFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <HardDrive className="w-2.5 h-2.5" />
                            <span>Drive KTP</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectMember(member)}
                          title={t.table.viewDetail}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {member.status === 'Pending Verifikasi' && (
                          <button
                            onClick={() => handleVerify(member.id)}
                            title={t.table.verify}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleDeleteClick(member, e)}
                          title={t.table.delete}
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

        {/* Table Footer Summary */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Menampilkan <strong className="text-slate-700 dark:text-slate-200">{filteredMembers.length}</strong> dari{' '}
            <strong className="text-slate-700 dark:text-slate-200">{members.length}</strong> total anggota
          </span>
          <span>Status: Tersinkronisasi Otomatis</span>
        </div>
      </div>

      {/* Single Member Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Hapus Data Anggota"
        itemTitle={deleteTarget?.nama}
        itemSubtitle={`NIK: ${deleteTarget?.nik || '-'}`}
        itemBadge={deleteTarget?.jabatan || 'Anggota'}
        itemBadgeColor="blue"
        description={`Apakah Anda yakin ingin menghapus data anggota "${deleteTarget?.nama}"? Tindakan ini akan menghapus data secara permanen dari basis data dan arsip keanggotaan.`}
        isLoading={isDeletingSingle}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setIsDeletingSingle(true);
          try {
            await deleteMember(deleteTarget.id);
            setSelectedMemberIds((prev) => prev.filter((id) => id !== deleteTarget.id));
            setDeleteTarget(null);
          } finally {
            setIsDeletingSingle(false);
          }
        }}
        onCancel={() => {
          if (!isDeletingSingle) setDeleteTarget(null);
        }}
      />

      {/* Batch Members Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showBatchDeleteModal}
        title="Hapus Beberapa Data Anggota"
        count={selectedMemberIds.length}
        description={`Apakah Anda yakin ingin menghapus ${selectedMemberIds.length} data anggota yang dipilih secara permanen dari basis data organisasi? Data yang telah dihapus tidak dapat dipulihkan kembali.`}
        isLoading={isBatchDeleting}
        onConfirm={async () => {
          setIsBatchDeleting(true);
          try {
            await deleteMultipleMembers(selectedMemberIds);
            setSelectedMemberIds([]);
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
