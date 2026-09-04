export type MemberRole = string;

export type MemberStatus = 'Aktif' | 'Non-Aktif' | 'Pending Verifikasi' | 'Ditangguhkan';

export type SyncState = 'synced' | 'pending' | 'error' | 'local_only';

export interface Member {
  id: string;
  nik: string;
  nama: string;
  alamat: string;
  rtRw?: string;
  kelurahan?: string;
  kecamatan?: string;
  kotaKabupaten?: string;
  provinsi?: string;
  tempatTglLahir?: string;
  jenisKelamin?: 'LAKI-LAKI' | 'PEREMPUAN' | string;
  agama?: string;
  pekerjaan?: string;
  jabatan: string; // Jabatan & Divisi Organisasi manual input
  departemen: string;
  status: MemberStatus;
  fotoKtpUrl?: string; // Base64 or Drive preview URL
  driveFileId?: string;
  driveFileUrl?: string;
  sheetsRowIndex?: number;
  syncStatus: SyncState;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
  email?: string;
  telepon?: string;
  ocrConfidence?: number;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export type NavigationTab =
  | 'dashboard'
  | 'members'
  | 'registration'
  | 'letters'
  | 'workspace'
  | 'security'
  | 'backup';

// --- Surat Masuk & Surat Keluar Types ---
export type LetterType = 'Surat Masuk' | 'Surat Keluar';

export type LetterCategory =
  | 'Undangan'
  | 'Pemberitahuan'
  | 'Permohonan'
  | 'Keputusan (SK)'
  | 'Laporan'
  | 'Kerjasama (MoU)'
  | 'Tugas / Mandat'
  | 'Edaran'
  | 'Lainnya';

export type LetterUrgency = 'Biasa' | 'Penting' | 'Segera' | 'Rahasia';

export type LetterStatus =
  | 'Diterima'
  | 'Diproses'
  | 'Disposisi'
  | 'Selesai'
  | 'Terkirim'
  | 'Diarsipkan';

export interface LetterAttachment {
  name: string;
  size: number;
  type: string; // e.g. application/pdf, image/jpeg, application/vnd.openxmlformats-officedocument.wordprocessingml.document
  dataUrl?: string; // Base64 data for storage & preview
  format: 'pdf' | 'excel' | 'word' | 'image' | 'other';
}

export interface Letter {
  id: string;
  type: LetterType;
  nomorSurat: string;
  perihal: string;
  pengirim: string;
  penerima: string;
  tanggalSurat: string; // YYYY-MM-DD
  tanggalDiterimaKirim: string; // YYYY-MM-DD
  kategori: LetterCategory | string;
  sifat: LetterUrgency;
  status: LetterStatus;
  ringkasan: string;
  disposisiCatatan?: string;
  disposisiKepada?: string;
  fileAttachment?: LetterAttachment;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'Super Admin' | 'Admin Verifikator' | 'Pengurus / Operator' | 'Auditor / Viewer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token?: string;
  twoFactorEnabled: boolean;
  avatarUrl?: string;
}

export interface KtpOcrResult {
  success: boolean;
  nik: string;
  nama: string;
  tempatTglLahir: string;
  jenisKelamin: string;
  alamat: string;
  rtRw: string;
  kelDesa: string;
  kecamatan: string;
  agama: string;
  statusPerkawinan: string;
  pekerjaan: string;
  kewarganegaraan: string;
  berlakuHingga: string;
  confidenceScore: number;
  rawText?: string;
  retryCount?: number;
  error?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  memberId?: string;
  actionUrl?: string;
}

export interface GoogleWorkspaceConfig {
  connected: boolean;
  userEmail?: string;
  userName?: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  sheetName: string;
  driveFolderId?: string;
  driveFolderName: string;
  autoSync: boolean;
  lastSyncTime?: string;
}

export interface ExternalApiConfig {
  endpointUrl: string;
  apiKey: string;
  syncIntervalMinutes: number;
  active: boolean;
  lastPingStatus?: 'success' | 'error' | 'idle';
  lastPingTime?: string;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  totalRecords: number;
  sizeBytes: number;
  type: 'auto_cloud' | 'manual_export';
  status: 'completed' | 'failed';
  downloadUrl?: string;
}
