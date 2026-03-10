export const AUTH_STORAGE_KEY = 'obs_auth';

export const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    return {
      accessToken: parsed.accessToken || null,
      refreshToken: parsed.refreshToken || null,
      user: parsed.user || null,
    };
  } catch {
    return null;
  }
};

export const setAuthStorage = ({ accessToken, refreshToken, user }) => {
  const existing = getStoredAuth() || {};
  const payload = {
    accessToken: accessToken ?? existing.accessToken ?? null,
    refreshToken: refreshToken ?? existing.refreshToken ?? null,
    user: user ?? existing.user ?? null,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  return payload;
};

export const setTokens = ({ accessToken, refreshToken }) =>
  setAuthStorage({ accessToken, refreshToken });

export const clearAuthStorage = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getAccessToken = () => getStoredAuth()?.accessToken || null;

export const getRefreshToken = () => getStoredAuth()?.refreshToken || null;
