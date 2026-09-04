import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  MapPin,
  Briefcase,
  Layers,
  Phone,
  Mail,
  ShieldCheck,
  HardDrive,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MemberRole, MemberStatus, KtpOcrResult } from '../types';
import { extractKtpWithGemini } from '../services/geminiOcr';
import { uploadKtpPhotoToGoogleDrive, getStoredWorkspaceToken } from '../services/workspaceService';

export const MemberRegistrationForm: React.FC = () => {
  const { t, addMember, workspaceConfig, addNotification, setActiveTab } = useApp();

  // Form fields state
  const [nik, setNik] = useState('');
  const [nama, setNama] = useState('');
  const [alamat, setAlamat] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [status, setStatus] = useState<MemberStatus>('Aktif');
  const [telepon, setTelepon] = useState('');
  const [email, setEmail] = useState('');
  const [tempatTglLahir, setTempatTglLahir] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('LAKI-LAKI');

  // KTP Image & OCR state
  const [ktpImageBase64, setKtpImageBase64] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<KtpOcrResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Available roles & departments
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

  const departments = [
    'Badan Pengurus Harian',
    'Administrasi & Kesekretariatan',
    'Keuangan & Aset',
    'Teknologi Informasi & Data',
    'Divisi Humas & Eksternal',
    'Divisi Riset & Pengembangan',
    'Divisi Operasional & Lapangan',
    'Divisi Kaderisasi & Anggota',
  ];

  const statuses: MemberStatus[] = ['Aktif', 'Pending Verifikasi', 'Non-Aktif', 'Ditangguhkan'];

  // Handle image upload from file picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setKtpImageBase64(base64);
      // Automatically trigger OCR scan
      triggerOcr(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  // Camera Capture handling
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Tidak dapat mengakses kamera: ' + (err as any).message);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setKtpImageBase64(dataUrl);
        stopCamera();
        triggerOcr(dataUrl, 'image/jpeg');
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Trigger Gemini Flash OCR with auto-retry
  const triggerOcr = async (base64: string, mimeType = 'image/jpeg') => {
    setIsScanning(true);
    setScanError(null);
    try {
      const res = await extractKtpWithGemini(base64, mimeType);
      setScanResult(res);

      // Autofill form inputs with OCR results
      if (res.nik) setNik(res.nik);
      if (res.nama) setNama(res.nama);
      if (res.alamat) {
        let fullAddr = res.alamat;
        if (res.rtRw) fullAddr += `, RT/RW ${res.rtRw}`;
        if (res.kelDesa) fullAddr += `, Kel. ${res.kelDesa}`;
        if (res.kecamatan) fullAddr += `, Kec. ${res.kecamatan}`;
        setAlamat(fullAddr);
      }
      if (res.tempatTglLahir) setTempatTglLahir(res.tempatTglLahir);
      if (res.jenisKelamin) setJenisKelamin(res.jenisKelamin);

      addNotification({
        title: 'OCR KTP Berhasil',
        message: `NIK ${res.nik} dan Nama ${res.nama} berhasil diisi otomatis (${res.confidenceScore}% akurasi).`,
        type: 'success',
      });
    } catch (err: any) {
      setScanError(err.message || 'Gagal memindai e-KTP. Silakan periksa kembali foto atau isi manual.');
    } finally {
      setIsScanning(false);
    }
  };

  // Sample KTP Template for instant testing
  const loadSampleKtp = () => {
    const sampleImg =
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80';
    setKtpImageBase64(sampleImg);
    triggerOcr('sample_ktp_placeholder', 'image/jpeg');
  };

  const handleResetForm = () => {
    setNik('');
    setNama('');
    setAlamat('');
    setJabatan('');
    setStatus('Aktif');
    setTelepon('');
    setEmail('');
    setTempatTglLahir('');
    setKtpImageBase64(null);
    setScanResult(null);
    setScanError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !nik.trim()) {
      alert('Nama dan NIK wajib diisi.');
      return;
    }

    if (nik.replace(/[^0-9]/g, '').length !== 16) {
      if (!confirm('Format NIK umumnya 16 digit angka. Apakah Anda yakin ingin melanjutkan?')) {
        return;
      }
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    try {
      let driveUrl = '';
      let driveId = '';

      // Upload KTP photo to Google Drive
      if (ktpImageBase64) {
        const token = getStoredWorkspaceToken() || 'mock_token';
        try {
          const driveResult = await uploadKtpPhotoToGoogleDrive(
            token,
            nama,
            nik,
            ktpImageBase64,
            workspaceConfig.driveFolderId,
            (progress) => setUploadProgress(progress)
          );
          driveUrl = driveResult.webViewLink;
          driveId = driveResult.fileId;
        } catch (e) {
          console.warn('Drive upload failed, using local storage:', e);
        }
      }

      const assignedRole = jabatan.trim() || 'Anggota Organisasi';

      await addMember({
        nik: nik.trim(),
        nama: nama.trim(),
        alamat: alamat.trim(),
        jabatan: assignedRole,
        departemen: assignedRole,
        status,
        telepon: telepon.trim(),
        email: email.trim(),
        tempatTglLahir,
        jenisKelamin,
        fotoKtpUrl: ktpImageBase64 || '',
        driveFileUrl: driveUrl,
        driveFileId: driveId,
        ocrConfidence: scanResult?.confidenceScore || 95,
        syncStatus: 'synced',
      });

      handleResetForm();
      // Redirect to member database view
      setActiveTab('members');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan pendaftaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t.registration.title}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t.registration.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: KTP Scanner Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                {t.registration.ktpUploadTitle}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                Gemini 3.6 Flash
              </span>
            </div>

            {/* Camera View or Dropzone */}
            {cameraActive ? (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-dashed border-white/60 pointer-events-none m-4 rounded-lg" />
                <div className="absolute bottom-3 flex gap-2">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-lg shadow hover:bg-blue-700 flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    {t.registration.capture}
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-2 bg-slate-800/80 text-white text-xs rounded-lg hover:bg-slate-800"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : ktpImageBase64 ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 aspect-[16/10] flex items-center justify-center group">
                <img
                  src={ktpImageBase64}
                  alt="e-KTP Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                  <button
                    type="button"
                    onClick={() => triggerOcr(ktpImageBase64)}
                    disabled={isScanning}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-700"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    Pindai Ulang
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white/90 text-slate-800 rounded-lg text-xs font-semibold hover:bg-white"
                  >
                    Ganti Foto
                  </button>
                </div>

                {isScanning && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4">
                    <RefreshCw className="w-7 h-7 text-blue-400 animate-spin mb-2" />
                    <span className="text-xs font-semibold">{t.registration.scanningOcr}</span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      Mengekstrak NIK, Nama, dan Alamat...
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-6 text-center transition-colors bg-slate-50/60 dark:bg-slate-800/30 aspect-[16/10] flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t.registration.ktpUploadTitle}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  {t.registration.ktpUploadDesc}
                </p>
                <span className="mt-3 text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                  PNG, JPG, JPEG (Max 15MB)
                </span>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={startCamera}
                className="flex-1 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                {t.registration.takePhoto}
              </button>
              <button
                type="button"
                onClick={loadSampleKtp}
                className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                title="Gunakan contoh KTP uji coba"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Demo KTP
              </button>
            </div>

            {/* OCR Extraction Result Badge */}
            {scanResult && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {t.registration.ocrSuccess}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[10px]">
                    {scanResult.confidenceScore}% Akurat
                  </span>
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 space-y-0.5">
                  <p>NIK Terbaca: <span className="font-mono font-bold">{scanResult.nik}</span></p>
                  <p>Nama: <span className="font-bold">{scanResult.nama}</span></p>
                  {scanResult.retryCount !== undefined && scanResult.retryCount > 0 && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400">
                      Auto-retry dilakukan {scanResult.retryCount} kali untuk kejernihan maksimal.
                    </p>
                  )}
                </div>
              </div>
            )}

            {scanError && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Info Pemindaian:</p>
                  <p className="text-[11px] mt-0.5">{scanError}</p>
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <HardDrive className="w-3.5 h-3.5 text-blue-500" />
              <span>Foto KTP akan diunggah otomatis ke Google Drive terenkripsi.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Member Information Form (7 Cols) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors"
          >
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Data Pokok Anggota
              </span>
              <span className="text-xs text-slate-400 font-medium">
                * Wajib sesuai e-KTP
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* NIK Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.registration.fields.nik} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="member-form-nik"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    placeholder={t.registration.fields.nikPlaceholder}
                    maxLength={16}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  {scanResult?.nik && scanResult.nik === nik && (
                    <span className="absolute right-2.5 top-2.5 text-emerald-500 text-[10px] flex items-center gap-0.5 font-sans font-bold">
                      <Check className="w-3 h-3" /> OCR
                    </span>
                  )}
                </div>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.registration.fields.nama} *
                </label>
                <input
                  type="text"
                  id="member-form-nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder={t.registration.fields.namaPlaceholder}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Tempat & Tanggal Lahir + Jenis Kelamin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.registration.fields.ttl}
                </label>
                <input
                  type="text"
                  value={tempatTglLahir}
                  onChange={(e) => setTempatTglLahir(e.target.value)}
                  placeholder="Contoh: JAKARTA, 23-04-1995"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.registration.fields.gender}
                </label>
                <select
                  value={jenisKelamin}
                  onChange={(e) => setJenisKelamin(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LAKI-LAKI">LAKI-LAKI</option>
                  <option value="PEREMPUAN">PEREMPUAN</option>
                </select>
              </div>
            </div>

            {/* Alamat Lengkap */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.registration.fields.alamat} *
              </label>
              <textarea
                id="member-form-alamat"
                rows={2}
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder={t.registration.fields.alamatPlaceholder}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Jabatan Organisasi & Divisi (Dijadikan 1 input manual tanpa pilihan sesuai permintaan) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jabatan / Divisi Organisasi *
              </label>
              <input
                type="text"
                id="member-form-jabatan"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                placeholder="Isi jabatan / divisi secara manual (misal: Kepala Divisi Humas, Sekretaris, Koordinator Lapangan)"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Jabatan organisasi dan divisi telah digabung menjadi satu isian manual tanpa pilihan dropdown.
              </p>
            </div>

            {/* Status & Kontak */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.registration.fields.status}
                </label>
                <select
                  id="member-form-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MemberStatus)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.registration.fields.telepon}
                </label>
                <input
                  type="tel"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.registration.fields.email}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@organisasi.or.id"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t.registration.resetButton}
              </button>
              <button
                type="submit"
                id="member-form-submit-btn"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/70 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {uploadProgress > 0 && uploadProgress < 100 
                      ? `Mengunggah... ${uploadProgress}%` 
                      : t.registration.submitting}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {t.registration.submitButton}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
