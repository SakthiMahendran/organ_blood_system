import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

import { authService } from '../services/authService';
import { AUTH_ACTIONS, authInitialState, authReducer } from '../reducers/authReducer';
import { AUTH_STORAGE_KEY, clearAuthStorage, getStoredAuth, setAuthStorage } from '../utils/authStorage';

const AuthContext = createContext(null);

const syncAuthAndDispatch = (dispatch, payload) => {
  const persisted = setAuthStorage(payload);
  dispatch({
    type: AUTH_ACTIONS.AUTH_SUCCESS,
    payload: {
      user: persisted.user,
      accessToken: persisted.accessToken,
      refreshToken: persisted.refreshToken,
    },
  });
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, authInitialState);

  const logout = useCallback(async ({ skipApi = false } = {}) => {
    const refreshToken = state.refreshToken || getStoredAuth()?.refreshToken;

    if (!skipApi) {
      try {
        await authService.logout(refreshToken);
      } catch {
        // Ignore server logout errors and continue local cleanup.
      }
    }

    clearAuthStorage();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, [state.refreshToken]);

  const bootstrap = useCallback(async () => {
    const stored = getStoredAuth();
    if (!stored?.accessToken) {
      dispatch({ type: AUTH_ACTIONS.BOOTSTRAP_DONE, payload: null });
      return;
    }

    try {
      const user = await authService.me();
      setAuthStorage({
        accessToken: stored.accessToken,
        refreshToken: stored.refreshToken,
        user,
      });

      dispatch({
        type: AUTH_ACTIONS.BOOTSTRAP_DONE,
        payload: {
          accessToken: stored.accessToken,
          refreshToken: stored.refreshToken,
          user,
        },
      });
    } catch {
      clearAuthStorage();
      dispatch({ type: AUTH_ACTIONS.BOOTSTRAP_DONE, payload: null });
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const onForcedLogout = () => {
      logout({ skipApi: true });
    };

    const onTokensUpdated = (event) => {
      const current = getStoredAuth();
      if (!current) {
        return;
      }
      dispatch({
        type: AUTH_ACTIONS.TOKENS_UPDATED,
        payload: {
          accessToken: event.detail?.accessToken || current.accessToken,
          refreshToken: event.detail?.refreshToken || current.refreshToken,
        },
      });
    };

    const onStorageChanged = (event) => {
      if (event.key !== AUTH_STORAGE_KEY) {
        return;
      }

      const current = getStoredAuth();
      if (!current?.accessToken || !current?.user) {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        return;
      }

      dispatch({
        type: AUTH_ACTIONS.BOOTSTRAP_DONE,
        payload: {
          accessToken: current.accessToken,
          refreshToken: current.refreshToken,
          user: current.user,
        },
      });
    };

    window.addEventListener('auth:logout', onForcedLogout);
    window.addEventListener('auth:tokens-updated', onTokensUpdated);
    window.addEventListener('storage', onStorageChanged);

    return () => {
      window.removeEventListener('auth:logout', onForcedLogout);
      window.removeEventListener('auth:tokens-updated', onTokensUpdated);
      window.removeEventListener('storage', onStorageChanged);
    };
  }, [logout]);

  const login = useCallback(async (credentials) => {
    const payload = await authService.login(credentials);
    syncAuthAndDispatch(dispatch, {
      accessToken: payload.tokens?.access,
      refreshToken: payload.tokens?.refresh,
      user: payload.user,
    });
    return payload.user;
  }, []);

  const register = useCallback(async (input) => {
    const payload = await authService.register(input);
    syncAuthAndDispatch(dispatch, {
      accessToken: payload.tokens?.access,
      refreshToken: payload.tokens?.refresh,
      user: payload.user,
    });
    return payload.user;
  }, []);

  const refreshProfile = useCallback(async () => {
    const user = await authService.me();
    const stored = setAuthStorage({ user });
    dispatch({ type: AUTH_ACTIONS.USER_UPDATED, payload: stored.user });
    return user;
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [state, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
