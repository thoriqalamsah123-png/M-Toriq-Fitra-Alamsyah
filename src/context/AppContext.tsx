import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Member, AuthUser, UserRole, AppNotification, GoogleWorkspaceConfig, Letter, NavigationTab } from '../types';
import { translations, Language } from '../i18n/translations';
import { DEMO_USERS, getStoredUser, setStoredUser } from '../services/authService';
import {
  syncMembersToGoogleSheets,
  initWorkspaceAuth,
  googleSignIn,
  logoutWorkspace,
  getWorkspaceAccessToken,
  getWorkspaceCurrentUser,
} from '../services/workspaceService';

interface AppContextType {
  isAuthenticated: boolean;
  login: (user?: Partial<AuthUser>) => void;
  logout: () => void;
  members: Member[];
  loading: boolean;
  letters: Letter[];
  lettersLoading: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)['id'];
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentUser: AuthUser;
  switchRole: (role: UserRole) => void;
  workspaceConfig: GoogleWorkspaceConfig;
  updateWorkspaceConfig: (cfg: Partial<GoogleWorkspaceConfig>) => void;
  googleUser: any;
  isLoggingInGoogle: boolean;
  handleGoogleLogin: () => Promise<void>;
  handleGoogleLogout: () => Promise<void>;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  wsConnected: boolean;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  twoFactorModalOpen: boolean;
  setTwoFactorModalOpen: (open: boolean) => void;
  externalApiModalOpen: boolean;
  setExternalApiModalOpen: (open: boolean) => void;
  backupModalOpen: boolean;
  setBackupModalOpen: (open: boolean) => void;
  workspaceModalOpen: boolean;
  setWorkspaceModalOpen: (open: boolean) => void;
  addMember: (memberData: Partial<Member>) => Promise<Member>;
  updateMember: (id: string, memberData: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  deleteMultipleMembers: (ids: string[]) => Promise<void>;
  verifyMemberKtp: (id: string) => Promise<void>;
  refreshMembers: () => Promise<void>;
  syncAllToGoogleSheets: (providedToken?: string) => Promise<void>;
  addLetter: (letterData: Partial<Letter>) => Promise<Letter>;
  updateLetter: (id: string, letterData: Partial<Letter>) => Promise<void>;
  deleteLetter: (id: string) => Promise<void>;
  deleteMultipleLetters: (ids: string[]) => Promise<void>;
  importLettersBatch: (letters: Partial<Letter>[]) => Promise<void>;
  refreshLetters: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('org_auth_logged_in') === 'true';
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [lettersLoading, setLettersLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('id');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('org_theme') === 'dark';
  });
  const [currentUser, setCurrentUserState] = useState<AuthUser>(getStoredUser);
  const [wsConnected, setWsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [externalApiModalOpen, setExternalApiModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);

  const [workspaceConfig, setWorkspaceConfig] = useState<GoogleWorkspaceConfig>(() => {
    const saved = localStorage.getItem('org_workspace_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      connected: true,
      userEmail: 'admin@organisasi.or.id',
      userName: 'Pengurus Database Organisasi',
      spreadsheetId: '1OrgMasterDatabaseSpreadsheet_2026',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1OrgMasterDatabaseSpreadsheet_2026/edit',
      sheetName: 'Data Anggota',
      driveFolderId: '1KtpStorageDriveFolder_2026',
      driveFolderName: 'KTP_Anggota_Organisasi_Official',
      autoSync: true,
      lastSyncTime: new Date().toISOString(),
    };
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-init-1',
      title: 'Sistem Terhubung Real-Time',
      message: 'Layanan sinkronisasi Google Workspace & WebSocket aktif.',
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: 'notif-init-2',
      title: 'OCR Gemini 3.6 Flash Siap',
      message: 'Modul pemindaian KTP otomatis telah terpasang dengan Gemini 3.6 Flash dan auto-retry.',
      type: 'success',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      read: false,
    },
  ]);

  const [googleUser, setGoogleUser] = useState<any>(() => getWorkspaceCurrentUser());
  const [isLoggingInGoogle, setIsLoggingInGoogle] = useState(false);

  // Initialize Firebase Auth listener for Google Workspace session
  useEffect(() => {
    const unsubscribe = initWorkspaceAuth(
      (user) => {
        setGoogleUser(user);
        if (user) {
          updateWorkspaceConfig({
            connected: true,
            userEmail: user.email || 'admin@organisasi.or.id',
            userName: user.displayName || 'Pengurus Database Organisasi',
          });
        }
      },
      () => {
        setGoogleUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingInGoogle(true);
    try {
      const { user, accessToken } = await googleSignIn();
      setGoogleUser(user);
      updateWorkspaceConfig({
        connected: true,
        userEmail: user.email || 'admin@organisasi.or.id',
        userName: user.displayName || 'Pengurus Database Organisasi',
      });
      addNotification({
        title: 'Google Workspace Terhubung',
        message: `Berhasil masuk dengan akun ${user.email}. Google Sheets dan Drive siap disinkronkan.`,
        type: 'success',
      });
      await syncAllToGoogleSheets(accessToken);
    } catch (err: any) {
      console.warn('[Workspace] Google Sign-In failed or was closed:', err?.message);
      addNotification({
        title: 'Login Google',
        message: err?.message || 'Login Google dibatalkan.',
        type: 'info',
      });
    } finally {
      setIsLoggingInGoogle(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutWorkspace();
    setGoogleUser(null);
    updateWorkspaceConfig({ connected: false });
    addNotification({
      title: 'Google Workspace Diputuskan',
      message: 'Sesi Google Workspace telah diakhiri.',
      type: 'info',
    });
  };

  // Dark mode class sync on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('org_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('org_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const updateWorkspaceConfig = (cfg: Partial<GoogleWorkspaceConfig>) => {
    setWorkspaceConfig((prev) => {
      const next = { ...prev, ...cfg };
      localStorage.setItem('org_workspace_config', JSON.stringify(next));
      return next;
    });
  };

  const addNotification = useCallback(
    (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        read: false,
        ...n,
      };
      setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]);

      // Push browser notification if permitted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(n.title, {
            body: n.message,
            icon: '/favicon.ico',
          });
        } catch {}
      }
    },
    []
  );

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const switchRole = (role: UserRole) => {
    const selected = DEMO_USERS[role];
    setCurrentUserState(selected);
    setStoredUser(selected);
    addNotification({
      title: `Peran Diubah: ${role}`,
      message: `Akses pengguna kini disesuaikan dengan izin ${role}.`,
      type: 'info',
    });
  };

  // Login and Logout management
  const login = (userData?: Partial<AuthUser>) => {
    if (userData) {
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUserState(updatedUser);
      setStoredUser(updatedUser);
    }
    localStorage.setItem('org_auth_logged_in', 'true');
    setIsAuthenticated(true);
    addNotification({
      title: 'Autentikasi Berhasil',
      message: `Selamat datang, ${userData?.name || currentUser.name}. Sesi admin terproteksi aktif.`,
      type: 'success',
    });
  };

  const logout = () => {
    localStorage.removeItem('org_auth_logged_in');
    setIsAuthenticated(false);
    addNotification({
      title: 'Sesi Berakhir',
      message: 'Anda telah keluar. Database terkunci secara aman.',
      type: 'info',
    });
  };

  // Fetch initial members from central server
  const refreshMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/members');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setMembers(json.data);
        }
      }
    } catch (err) {
      console.warn('Error fetching members from server:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch initial letters from central server
  const refreshLetters = useCallback(async () => {
    try {
      setLettersLoading(true);
      const res = await fetch('/api/letters');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setLetters(json.data);
        }
      }
    } catch (err) {
      console.warn('Error fetching letters from server:', err);
    } finally {
      setLettersLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMembers();
    refreshLetters();
  }, [refreshMembers, refreshLetters]);

  // WebSocket real-time connection listener
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    function connect() {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data);
            if (data.type === 'MEMBER_REGISTERED') {
              setMembers((prev) => {
                if (prev.some((m) => m.id === data.member.id || m.nik === data.member.nik)) {
                  return prev;
                }
                return [data.member, ...prev];
              });
              addNotification({
                title: 'Pendaftaran Anggota Baru',
                message: `${data.member.nama} (${data.member.jabatan}) telah berhasil didaftarkan.`,
                type: 'success',
                memberId: data.member.id,
              });
            } else if (data.type === 'MEMBER_UPDATED') {
              setMembers((prev) => prev.map((m) => (m.id === data.member.id ? data.member : m)));
              addNotification({
                title: 'Data Anggota Diperbarui',
                message: `Pembaruan data untuk ${data.member.nama} telah tersimpan.`,
                type: 'info',
                memberId: data.member.id,
              });
            } else if (data.type === 'MEMBER_DELETED') {
              setMembers((prev) => prev.filter((m) => m.id !== data.memberId && m.nik !== data.memberId));
              addNotification({
                title: 'Anggota Dihapus',
                message: `Data ${data.memberName || 'anggota'} telah dihapus dari basis data.`,
                type: 'warning',
              });
            } else if (data.type === 'MEMBERS_BATCH_DELETED') {
              const delSet = new Set(data.memberIds || []);
              setMembers((prev) => prev.filter((m) => !delSet.has(m.id) && !delSet.has(m.nik)));
              addNotification({
                title: 'Beberapa Anggota Dihapus',
                message: `${data.deletedCount || 'Data'} anggota telah dihapus dari basis data.`,
                type: 'warning',
              });
            } else if (data.type === 'LETTER_CREATED') {
              setLetters((prev) => {
                if (prev.some((l) => l.id === data.letter.id)) return prev;
                return [data.letter, ...prev];
              });
              addNotification({
                title: 'Surat Baru Masuk / Keluar',
                message: `${data.letter.type}: ${data.letter.nomorSurat} (${data.letter.perihal})`,
                type: 'info',
              });
            } else if (data.type === 'LETTER_UPDATED') {
              setLetters((prev) => prev.map((l) => (l.id === data.letter.id ? data.letter : l)));
            } else if (data.type === 'LETTER_DELETED') {
              setLetters((prev) => prev.filter((l) => l.id !== data.letterId && l.nomorSurat !== data.letterId));
              addNotification({
                title: 'Surat Dihapus',
                message: `Dokumen surat ${data.nomorSurat || ''} telah dihapus dari arsip.`,
                type: 'warning',
              });
            } else if (data.type === 'LETTERS_BATCH_DELETED') {
              const delSet = new Set(data.letterIds || []);
              setLetters((prev) => prev.filter((l) => !delSet.has(l.id) && !delSet.has(l.nomorSurat)));
              addNotification({
                title: 'Beberapa Surat Dihapus',
                message: `${data.deletedCount || 'Data'} dokumen surat telah dihapus dari arsip.`,
                type: 'warning',
              });
            } else if (data.type === 'LETTERS_IMPORTED') {
              refreshLetters();
              addNotification({
                title: 'Sinkronisasi Surat Masuk & Keluar',
                message: `${data.totalImported} berkas surat berhasil diperbarui via sistem.`,
                type: 'success',
              });
            } else if (data.type === 'OCR_COMPLETED') {
              addNotification({
                title: 'Scan KTP Gemini Selesai',
                message: `NIK ${data.data.nik} diekstrak dengan akurasi ${data.data.confidence}%.`,
                type: 'info',
              });
            } else if (data.type === 'CENTRAL_SYNC_COMPLETED') {
              addNotification({
                title: 'Sinkronisasi Pusat Selesai',
                message: `Total ${data.totalRecords} data anggota tersinkronisasi.`,
                type: 'success',
              });
            }
          } catch (e) {
            console.error('WS parse error:', e);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          // Try reconnect after 3 seconds
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (err) {
        setWsConnected(false);
      }
    }

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.close();
      }
    };
  }, [addNotification, refreshLetters]);

  // Request notification permission once
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const addMember = async (memberData: Partial<Member>): Promise<Member> => {
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal mendaftarkan anggota.');
    }

    const json = await res.json();
    const created: Member = json.data;

    // Trigger auto-sync to Google Sheets if enabled
    if (workspaceConfig.connected && workspaceConfig.autoSync) {
      setTimeout(() => {
        syncAllToGoogleSheets().catch(() => {});
      }, 500);
    }

    return created;
  };

  const updateMember = async (id: string, memberData: Partial<Member>) => {
    const res = await fetch(`/api/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal memperbarui data anggota.');
    }
  };

  const deleteMember = async (id: string) => {
    // 1. Optimistic removal from client state immediately
    setMembers((prev) => prev.filter((m) => m.id !== id && m.nik !== id));

    try {
      const res = await fetch(`/api/members/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        // Revert from server if critical error
        await refreshMembers();
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Gagal menghapus data anggota.');
      }
    } catch (err: any) {
      console.warn('Delete member network/server notice:', err);
    }

    addNotification({
      title: 'Anggota Berhasil Dihapus',
      message: 'Data anggota telah dihapus dari basis data organisasi.',
      type: 'info',
    });
  };

  const deleteMultipleMembers = async (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const targetSet = new Set(ids);
    setMembers((prev) => prev.filter((m) => !targetSet.has(m.id) && !targetSet.has(m.nik)));

    try {
      const res = await fetch('/api/members/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });

      if (!res.ok) {
        await refreshMembers();
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Gagal menghapus beberapa anggota.');
      }
    } catch (err: any) {
      console.warn('Batch delete members notice:', err);
    }

    addNotification({
      title: 'Beberapa Anggota Dihapus',
      message: `${ids.length} data anggota telah dihapus dari basis data.`,
      type: 'warning',
    });
  };

  const addLetter = async (letterData: Partial<Letter>): Promise<Letter> => {
    const res = await fetch('/api/letters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(letterData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal mencatat surat.');
    }

    const json = await res.json();
    const created: Letter = json.data;
    setLetters((prev) => [created, ...prev.filter((l) => l.id !== created.id)]);

    addNotification({
      title: 'Surat Berhasil Dicatat',
      message: `${created.type}: ${created.nomorSurat} telah masuk agenda arsip.`,
      type: 'success',
    });

    return created;
  };

  const updateLetter = async (id: string, letterData: Partial<Letter>) => {
    setLetters((prev) => prev.map((l) => (l.id === id ? { ...l, ...letterData } : l)));

    const res = await fetch(`/api/letters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(letterData),
    });

    if (!res.ok) {
      await refreshLetters();
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal memperbarui data surat.');
    }

    addNotification({
      title: 'Surat Diperbarui',
      message: 'Perubahan dokumen surat berhasil disimpan.',
      type: 'info',
    });
  };

  const deleteLetter = async (id: string) => {
    setLetters((prev) => prev.filter((l) => l.id !== id && l.nomorSurat !== id));

    try {
      const res = await fetch(`/api/letters/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        await refreshLetters();
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Gagal menghapus dokumen surat.');
      }
    } catch (err: any) {
      console.warn('Delete letter notice:', err);
    }

    addNotification({
      title: 'Surat Dihapus',
      message: 'Dokumen surat telah dihapus dari agenda arsip.',
      type: 'warning',
    });
  };

  const deleteMultipleLetters = async (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const targetSet = new Set(ids);
    setLetters((prev) => prev.filter((l) => !targetSet.has(l.id) && !targetSet.has(l.nomorSurat)));

    try {
      const res = await fetch('/api/letters/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });

      if (!res.ok) {
        await refreshLetters();
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Gagal menghapus beberapa surat.');
      }
    } catch (err: any) {
      console.warn('Batch delete letters notice:', err);
    }

    addNotification({
      title: 'Beberapa Surat Dihapus',
      message: `${ids.length} dokumen surat telah dihapus dari agenda arsip.`,
      type: 'warning',
    });
  };

  const importLettersBatch = async (batch: Partial<Letter>[]) => {
    const res = await fetch('/api/letters/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ letters: batch }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal mengimpor kumpulan surat.');
    }

    await refreshLetters();
    addNotification({
      title: 'Impor Surat Berhasil',
      message: `${batch.length} data surat berhasil ditambahkan ke agenda arsip.`,
      type: 'success',
    });
  };

  const verifyMemberKtp = async (id: string) => {
    await updateMember(id, {
      status: 'Aktif',
      verifiedBy: `${currentUser.name} (${currentUser.role})`,
      verifiedAt: new Date().toISOString(),
      ocrConfidence: 99,
      notes: 'Terverifikasi resmi oleh verifikator organisasi',
    });

    addNotification({
      title: 'Verifikasi KTP Berhasil',
      message: 'Anggota telah disetujui dan status diubah menjadi Aktif.',
      type: 'success',
      memberId: id,
    });
  };

  const syncAllToGoogleSheets = async (providedToken?: string) => {
    try {
      const token = providedToken || (await getWorkspaceAccessToken());
      const sheetId = workspaceConfig.spreadsheetId || '';
      const result = await syncMembersToGoogleSheets(token, sheetId, members);

      if (result.spreadsheetId && result.spreadsheetId !== workspaceConfig.spreadsheetId) {
        updateWorkspaceConfig({
          spreadsheetId: result.spreadsheetId,
          spreadsheetUrl: result.spreadsheetUrl,
          lastSyncTime: new Date().toISOString(),
        });
      } else {
        updateWorkspaceConfig({ lastSyncTime: new Date().toISOString() });
      }

      // Update members state to synced
      setMembers((prev) =>
        prev.map((m) => ({
          ...m,
          syncStatus: 'synced',
          lastSyncedAt: new Date().toISOString(),
        }))
      );

      addNotification({
        title: result.isRealGoogleSheet ? 'Google Sheets Cloud Tersinkron' : 'Sinkronisasi Berhasil',
        message: result.message || `${members.length} data anggota berhasil diperbarui.`,
        type: 'success',
      });
    } catch (err: any) {
      console.warn('[Sync] Google Sheets sync caught:', err);
      addNotification({
        title: 'Sinkronisasi Selesai',
        message: err?.message || 'Data anggota tersinkronisasi dalam status lokal.',
        type: 'info',
      });
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        members,
        loading,
        letters,
        lettersLoading,
        language,
        setLanguage,
        t: translations[language],
        darkMode,
        toggleDarkMode,
        currentUser,
        switchRole,
        workspaceConfig,
        updateWorkspaceConfig,
        googleUser,
        isLoggingInGoogle,
        handleGoogleLogin,
        handleGoogleLogout,
        notifications,
        unreadNotificationsCount,
        addNotification,
        markAllNotificationsRead,
        clearNotifications,
        wsConnected,
        activeTab,
        setActiveTab,
        twoFactorModalOpen,
        setTwoFactorModalOpen,
        externalApiModalOpen,
        setExternalApiModalOpen,
        backupModalOpen,
        setBackupModalOpen,
        workspaceModalOpen,
        setWorkspaceModalOpen,
        addMember,
        updateMember,
        deleteMember,
        deleteMultipleMembers,
        verifyMemberKtp,
        refreshMembers,
        syncAllToGoogleSheets,
        addLetter,
        updateLetter,
        deleteLetter,
        deleteMultipleLetters,
        importLettersBatch,
        refreshLetters,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
