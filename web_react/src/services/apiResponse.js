import { getErrorMessage } from '../utils/errorUtils';

export const unwrapData = (response) => {
  const payload = response?.data;

  if (payload?.success === false) {
    const error = new Error(payload?.error?.message || 'Request failed');
    error.response = response;
    throw error;
  }

  if (payload && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data;
  }

  return payload;
};

export const toAppError = (error, fallback) => new Error(getErrorMessage(error, fallback));
