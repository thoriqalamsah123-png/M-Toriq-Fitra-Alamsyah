import { AuthUser, UserRole } from '../types';

export const DEMO_USERS: Record<UserRole, AuthUser> = {
  'Super Admin': {
    id: 'usr-1',
    name: 'Drs. Hendra Kusuma',
    email: 'hendra.kusuma@organisasi.or.id',
    role: 'Super Admin',
    twoFactorEnabled: true,
    token: 'jwt_mock_superadmin_token_xyz99',
  },
  'Admin Verifikator': {
    id: 'usr-2',
    name: 'Ratna Wulandari, S.H',
    email: 'ratna.verifikator@organisasi.or.id',
    role: 'Admin Verifikator',
    twoFactorEnabled: true,
    token: 'jwt_mock_verifikator_token_abc77',
  },
  'Pengurus / Operator': {
    id: 'usr-3',
    name: 'Budi Santoso',
    email: 'budi.operator@organisasi.or.id',
    role: 'Pengurus / Operator',
    twoFactorEnabled: false,
    token: 'jwt_mock_operator_token_opr44',
  },
  'Auditor / Viewer': {
    id: 'usr-4',
    name: 'Dr. Ir. Maya Indrawati',
    email: 'maya.auditor@organisasi.or.id',
    role: 'Auditor / Viewer',
    twoFactorEnabled: false,
    token: 'jwt_mock_viewer_token_vw11',
  },
};

const STORAGE_KEY_AUTH = 'org_auth_user';
const STORAGE_KEY_2FA = 'org_2fa_secret';

export function getStoredUser(): AuthUser {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return DEMO_USERS['Super Admin'];
}

export function setStoredUser(user: AuthUser) {
  localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
}

// 2FA TOTP Simulation
export interface TwoFactorState {
  enabled: boolean;
  secret: string;
  backupCodes: string[];
  currentCode: string;
  secondsRemaining: number;
}

export function generateTotpCode(secret: string): string {
  // Simple deterministic 6-digit TOTP calculation based on 30s epoch interval
  const timeStep = Math.floor(Date.now() / 30000);
  let hash = 0;
  const str = `${secret}_${timeStep}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const code = Math.abs(hash % 1000000)
    .toString()
    .padStart(6, '0');
  return code;
}

export function get2FaBackupCodes(): string[] {
  return ['8472-1920', '3910-4829', '5521-9930', '1029-4721', '6639-0182'];
}
