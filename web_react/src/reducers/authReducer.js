export const authInitialState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
};

export const AUTH_ACTIONS = {
  BOOTSTRAP_DONE: 'BOOTSTRAP_DONE',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  TOKENS_UPDATED: 'TOKENS_UPDATED',
  USER_UPDATED: 'USER_UPDATED',
  LOGOUT: 'LOGOUT',
};

export const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.BOOTSTRAP_DONE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: Boolean(action.payload?.user && action.payload?.accessToken),
        user: action.payload?.user || null,
        accessToken: action.payload?.accessToken || null,
        refreshToken: action.payload?.refreshToken || null,
      };
    case AUTH_ACTIONS.AUTH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    case AUTH_ACTIONS.TOKENS_UPDATED:
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    case AUTH_ACTIONS.USER_UPDATED:
      return {
        ...state,
        user: action.payload,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...authInitialState,
        isLoading: false,
      };
    default:
      return state;
  }
};
