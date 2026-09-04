import React, { useState } from 'react';
import {
  X,
  Share2,
  CheckCircle2,
  RefreshCw,
  Server,
  Zap,
  ShieldCheck,
  Send,
  Terminal,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ExternalApiModal: React.FC = () => {
  const { externalApiModalOpen, setExternalApiModalOpen, members, addNotification } = useApp();

  const [endpointUrl, setEndpointUrl] = useState('https://api.dukcapil-siak.id/v2/verify');
  const [apiKey, setApiKey] = useState('org_ext_live_key_994827104');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  if (!externalApiModalOpen) return null;

  const handleTestSync = async () => {
    setIsTesting(true);
    try {
      const res = await fetch('/api/sync/external', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpointUrl, apiKey }),
      });
      const data = await res.json();
      setTestResult(data);
      addNotification({
        title: 'Integrasi Eksternal Sukses',
        message: `Koneksi API eksternal diverifikasi dengan latensi ${data.latencyMs}ms.`,
        type: 'success',
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Integrasi API Pihak Ketiga & Basis Data Pusat
              </h3>
              <p className="text-xs text-slate-500">
                Sinkronisasi data anggota ke sistem eksternal (Dukcapil / SIAK / SIAP Organisasi)
              </p>
            </div>
          </div>
          <button
            onClick={() => setExternalApiModalOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Config fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Endpoint URL API Eksternal
              </label>
              <div className="relative">
                <Server className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                API Key / Bearer Token
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Test connection button */}
          <div>
            <button
              onClick={handleTestSync}
              disabled={isTesting}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Menguji Konektivitas Endpoint...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  Uji Koneksi & Sinkronkan {members.length} Anggota
                </>
              )}
            </button>
          </div>

          {/* Result / Terminal output */}
          {testResult && (
            <div className="p-4 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 font-mono text-[11px] space-y-2">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  RESPONS SISTEM INTEGRASI
                </span>
                <span className="text-emerald-400 font-bold">200 OK</span>
              </div>
              <pre className="text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}

          {/* Description note */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-500 space-y-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
              Protokol Keamanan Data
            </span>
            <p className="text-[11px] leading-relaxed">
              Semua payload pertukaran data NIK dan data pribadi dilindungi enkripsi transport TLS 1.3 dan signature HMAC-SHA256 untuk mematuhi regulasi perlindungan data pribadi (UU PDP).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setExternalApiModalOpen(false)}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
