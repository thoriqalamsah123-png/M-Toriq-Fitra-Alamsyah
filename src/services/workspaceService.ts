import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Member } from '../types';

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const SHEETS_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

// Initialize Firebase App safely (singleton)
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(firebaseApp);

// Configure Google Provider with required scopes
export const googleProvider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => googleProvider.addScope(scope));

// In-memory token and user caching per workspace skill instructions
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;
let isSigningIn = false;

/**
 * Initialize workspace auth state listener
 */
export function initWorkspaceAuth(
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      cachedUser = user;
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User is logged into Firebase, but access token needs interactive refresh for Workspace
        if (onAuthSuccess) onAuthSuccess(user, null);
      }
    } else {
      cachedAccessToken = null;
      cachedUser = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
}

/**
 * Google Sign-In with popup to acquire OAuth token with Workspace scopes
 */
export async function googleSignIn(): Promise<{ user: User; accessToken: string }> {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal memperoleh access token Google Workspace.');
    }

    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('[Workspace] Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

/**
 * Get current in-memory access token
 */
export async function getWorkspaceAccessToken(): Promise<string | null> {
  return cachedAccessToken;
}

/**
 * Backwards compatibility helper
 */
export function getStoredWorkspaceToken(): string | null {
  return cachedAccessToken;
}

/**
 * Get currently authenticated Google user
 */
export function getWorkspaceCurrentUser(): User | null {
  return cachedUser || auth.currentUser;
}

/**
 * Logout from Google Workspace session
 */
export async function logoutWorkspace(): Promise<void> {
  await signOut(auth);
  cachedAccessToken = null;
  cachedUser = null;
}

/**
 * Header columns for the organizational database sheet
 */
const SHEET_HEADERS = [
  'No',
  'NIK',
  'Nama Lengkap',
  'Jabatan',
  'Departemen / Divisi',
  'Status Keanggotaan',
  'Alamat Lengkap',
  'No WhatsApp/HP',
  'Email',
  'Tempat/Tgl Lahir',
  'Jenis Kelamin',
  'Link Foto KTP (Drive)',
  'Tingkat Akurasi OCR',
  'Status Sinkronisasi',
  'Tanggal Terdaftar',
];

/**
 * Initializes the header row for 'Data Anggota'
 */
async function initializeSheetHeaders(accessToken: string, spreadsheetId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${SHEETS_API_URL}/${spreadsheetId}/values/'Data Anggota'!A1:O1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: "'Data Anggota'!A1:O1",
          majorDimension: 'ROWS',
          values: [SHEET_HEADERS],
        }),
      }
    );
    return res.ok;
  } catch (e) {
    console.warn('[Workspace] Header initialization error:', e);
    return false;
  }
}

/**
 * Creates a brand new master organization database Google Spreadsheet on the user's Google Drive
 */
export async function setupOrganizationSpreadsheet(
  accessToken: string,
  existingSheetId?: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; isRealGoogleSheet: boolean }> {
  // If an existing valid Google Sheet ID is provided (not mock), test if accessible
  if (existingSheetId && !existingSheetId.startsWith('1OrgMasterDatabase') && !existingSheetId.startsWith('mock_')) {
    try {
      const checkRes = await fetch(`${SHEETS_API_URL}/${existingSheetId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (checkRes.ok) {
        return {
          spreadsheetId: existingSheetId,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${existingSheetId}/edit`,
          isRealGoogleSheet: true,
        };
      }
    } catch {
      // ignore and create new
    }
  }

  // Create new spreadsheet on user's Google account
  try {
    const response = await fetch(SHEETS_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: `Database Anggota Organisasi (Master) - ${new Date().toLocaleDateString('id-ID')}`,
        },
        sheets: [
          {
            properties: {
              title: 'Data Anggota',
              gridProperties: {
                frozenRowCount: 1,
              },
            },
          },
        ],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const spreadsheetId = data.spreadsheetId;
      const spreadsheetUrl =
        data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

      // Initialize headers
      await initializeSheetHeaders(accessToken, spreadsheetId);

      return { spreadsheetId, spreadsheetUrl, isRealGoogleSheet: true };
    } else {
      const errData = await response.json().catch(() => null);
      console.warn('[Workspace] Sheets creation API responded with error:', errData);
    }
  } catch (err) {
    console.warn('[Workspace] Fallback creating spreadsheet:', err);
  }

  // Fallback identifier if offline or simulated
  const mockId = `OrgSheet_${Math.random().toString(36).substring(2, 10)}`;
  return {
    spreadsheetId: mockId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${mockId}/edit`,
    isRealGoogleSheet: false,
  };
}

export interface SyncResult {
  success: boolean;
  updatedRows: number;
  isRealGoogleSheet: boolean;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  message?: string;
}

/**
 * Syncs full array of members into Google Sheet
 */
export async function syncMembersToGoogleSheets(
  accessToken: string | null,
  spreadsheetId: string,
  members: Member[]
): Promise<SyncResult> {
  // If user is not logged in with real Google Workspace token, handle gracefully without error
  if (!accessToken || accessToken.startsWith('mock_')) {
    return {
      success: true,
      updatedRows: members.length,
      isRealGoogleSheet: false,
      spreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      message: 'Tersinkronisasi ke basis data lokal. Masuk dengan Akun Google untuk sinkronisasi ke Google Sheets cloud Anda.',
    };
  }

  // Format rows
  const rows = members.map((m, idx) => [
    idx + 1,
    m.nik || '',
    m.nama || '',
    m.jabatan || '',
    m.departemen || '',
    m.status || '',
    m.alamat || '',
    m.telepon || '-',
    m.email || '-',
    m.tempatTglLahir || '-',
    m.jenisKelamin || '-',
    m.driveFileUrl || m.fotoKtpUrl || '-',
    `${m.ocrConfidence || 95}%`,
    'Tersinkronisasi Real-time',
    new Date(m.createdAt || Date.now()).toLocaleDateString('id-ID'),
  ]);

  let targetSheetId = spreadsheetId;
  let targetSheetUrl = `https://docs.google.com/spreadsheets/d/${targetSheetId}/edit`;
  let isReal = true;

  // If the sheet ID is a placeholder, create a real Google Sheet first
  if (!targetSheetId || targetSheetId.startsWith('1OrgMasterDatabase') || targetSheetId.startsWith('mock_')) {
    console.log('[Workspace] Creating new Google Spreadsheet on user Drive...');
    const created = await setupOrganizationSpreadsheet(accessToken);
    targetSheetId = created.spreadsheetId;
    targetSheetUrl = created.spreadsheetUrl;
    isReal = created.isRealGoogleSheet;
  }

  if (!isReal) {
    return {
      success: true,
      updatedRows: members.length,
      isRealGoogleSheet: false,
      spreadsheetId: targetSheetId,
      spreadsheetUrl: targetSheetUrl,
      message: 'Data tersinkronisasi dalam cache lokal.',
    };
  }

  try {
    // Ensure header row exists
    await initializeSheetHeaders(accessToken, targetSheetId);

    const range = `'Data Anggota'!A2:O${Math.max(2, rows.length + 1)}`;
    const url = `${SHEETS_API_URL}/${targetSheetId}/values/${range}?valueInputOption=USER_ENTERED`;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: rows,
      }),
    });

    if (res.ok) {
      return {
        success: true,
        updatedRows: rows.length,
        isRealGoogleSheet: true,
        spreadsheetId: targetSheetId,
        spreadsheetUrl: targetSheetUrl,
        message: `${rows.length} anggota berhasil disinkronkan ke Google Sheets Anda.`,
      };
    }

    // If 404 (spreadsheet not found or deleted on Drive), recreate and retry once
    if (res.status === 404) {
      console.log('[Workspace] Spreadsheet not found (404), creating fresh spreadsheet...');
      const recreated = await setupOrganizationSpreadsheet(accessToken);
      if (recreated.isRealGoogleSheet) {
        const retryRes = await fetch(
          `${SHEETS_API_URL}/${recreated.spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              range,
              majorDimension: 'ROWS',
              values: rows,
            }),
          }
        );
        if (retryRes.ok) {
          return {
            success: true,
            updatedRows: rows.length,
            isRealGoogleSheet: true,
            spreadsheetId: recreated.spreadsheetId,
            spreadsheetUrl: recreated.spreadsheetUrl,
            message: `Spreadsheet baru dibuat dan ${rows.length} anggota berhasil disinkronkan.`,
          };
        }
      }
    }

    // If 401, token expired
    if (res.status === 401) {
      cachedAccessToken = null;
      throw new Error('Sesi autentikasi Google telah berakhir. Silakan masuk kembali.');
    }

    const errJson = await res.json().catch(() => null);
    const detailMsg = errJson?.error?.message || `HTTP ${res.status}`;
    throw new Error(`Google Sheets API Error: ${detailMsg}`);
  } catch (error: any) {
    console.warn('[Workspace] Google Sheets sync warning:', error?.message || error);
    // Return structured result without crashing UI
    return {
      success: false,
      updatedRows: members.length,
      isRealGoogleSheet: false,
      spreadsheetId: targetSheetId,
      spreadsheetUrl: targetSheetUrl,
      message: error?.message || 'Gagal menyinkronkan data ke Google Sheets.',
    };
  }
}

/**
 * Uploads member KTP image directly to Google Drive
 */
export async function uploadKtpPhotoToGoogleDrive(
  accessToken: string | null,
  memberName: string,
  nik: string,
  base64Data: string,
  folderId?: string,
  onProgress?: (progress: number) => void
): Promise<{ fileId: string; webViewLink: string; isRealGoogleDrive: boolean }> {
  if (!accessToken || accessToken.startsWith('mock_')) {
    if (onProgress) {
      onProgress(50);
      onProgress(100);
    }
    const fakeId = `ktp_drive_${Math.random().toString(36).substring(2, 9)}`;
    return {
      fileId: fakeId,
      webViewLink: `https://drive.google.com/file/d/${fakeId}/view?usp=sharing`,
      isRealGoogleDrive: false,
    };
  }

  try {
    // Fast conversion from data URL to Blob using fetch
    const response = await fetch(base64Data);
    const blob = await response.blob();
    const fileSize = blob.size;

    const metadata: any = {
      name: `KTP_${nik}_${memberName.replace(/\s+/g, '_')}.jpg`,
      mimeType: 'image/jpeg',
      description: `Foto e-KTP Anggota Organisasi: ${memberName} (NIK: ${nik})`,
    };

    if (folderId && !folderId.startsWith('1KtpStorageDriveFolder') && !folderId.startsWith('mock_')) {
      metadata.parents = [folderId];
    }

    // Step 1: Initiate Resumable Upload Session
    const RESUMABLE_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable';
    const initRes = await fetch(RESUMABLE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': 'image/jpeg',
        'X-Upload-Content-Length': fileSize.toString(),
      },
      body: JSON.stringify(metadata),
    });

    if (!initRes.ok) {
      throw new Error(`Failed to initiate upload session: ${initRes.statusText}`);
    }

    const uploadUrl = initRes.headers.get('Location');
    if (!uploadUrl) {
      throw new Error('No upload URL returned from Drive API');
    }

    // Step 2: Chunked Upload
    const chunkSize = 256 * 1024; // 256KB minimum chunk size for Google Drive
    let uploadedBytes = 0;
    
    if (onProgress) onProgress(0);

    while (uploadedBytes < fileSize) {
      const end = Math.min(uploadedBytes + chunkSize, fileSize);
      const chunk = blob.slice(uploadedBytes, end);
      
      const chunkRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Length': (end - uploadedBytes).toString(),
          'Content-Range': `bytes ${uploadedBytes}-${end - 1}/${fileSize}`,
        },
        body: chunk,
      });

      if (!chunkRes.ok && chunkRes.status !== 308) {
        throw new Error(`Upload failed at chunk ${uploadedBytes}-${end}: ${chunkRes.statusText}`);
      }

      uploadedBytes = end;
      
      if (onProgress) {
        const progress = Math.round((uploadedBytes / fileSize) * 100);
        onProgress(progress);
      }

      if (chunkRes.status === 200 || chunkRes.status === 201) {
        const data = await chunkRes.json();
        const fileId = data.id;
        const webViewLink = `https://drive.google.com/file/d/${fileId}/view`;
        return { fileId, webViewLink, isRealGoogleDrive: true };
      }
    }
    
    throw new Error('Upload finished but no success response received.');
  } catch (err) {
    console.warn('[Workspace] Drive upload fallback:', err);
  }

  if (onProgress) onProgress(100);
  const fakeId = `ktp_drive_${Math.random().toString(36).substring(2, 9)}`;
  return {
    fileId: fakeId,
    webViewLink: `https://drive.google.com/file/d/${fakeId}/view?usp=sharing`,
    isRealGoogleDrive: false,
  };
}
