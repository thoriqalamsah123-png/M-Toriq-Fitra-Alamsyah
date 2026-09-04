import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  itemTitle?: string;
  itemSubtitle?: string;
  itemBadge?: string;
  itemBadgeColor?: 'red' | 'blue' | 'emerald' | 'amber' | 'purple';
  description?: string;
  count?: number;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  itemTitle,
  itemSubtitle,
  itemBadge,
  itemBadgeColor = 'red',
  description = 'Tindakan ini bersifat permanen. Data yang telah dihapus tidak dapat dipulihkan kembali dari basis data maupun arsip dokumen.',
  count,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const badgeColorClasses = {
    red: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  }[itemBadgeColor];

  return (
    <div
      id="confirm-delete-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onCancel();
        }
      }}
    >
      <div
        id="confirm-delete-modal-card"
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-red-200 dark:border-red-950 overflow-hidden transform transition-all"
      >
        {/* Header with warning icon */}
        <div className="p-5 flex items-start gap-3.5 border-b border-slate-100 dark:border-slate-800 bg-red-50/40 dark:bg-red-950/20">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-800/60">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Konfirmasi penghapusan data secara aman
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Target Item Summary Box */}
          {(itemTitle || count) && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {count ? (
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" />
                    {count} Data Terpilih
                  </span>
                ) : itemBadge ? (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeColorClasses}`}>
                    {itemBadge}
                  </span>
                ) : null}
              </div>

              {itemTitle && (
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm break-words">
                  {itemTitle}
                </div>
              )}

              {itemSubtitle && (
                <div className="text-xs text-slate-500 dark:text-slate-400 break-words font-mono">
                  {itemSubtitle}
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {description}
          </p>

          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <span className="font-bold shrink-0">Perhatian:</span>
            <span>Data yang telah dihapus akan langsung terhapus dari server sinkronisasi.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50/60 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Permanen</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
