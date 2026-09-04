export const STORAGE_KEY_CREDS = 'org_custom_creds';

export function getCustomCredentials() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CREDS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function setCustomCredentials(email: string, password: string) {
  localStorage.setItem(STORAGE_KEY_CREDS, JSON.stringify({ email, password }));
}
