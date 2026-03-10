export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error) {
    return fallback;
  }

  const apiError = error.response?.data?.error;
  if (apiError?.message) {
    return apiError.message;
  }

  if (typeof error.response?.data === 'string') {
    return error.response.data;
  }

  if (error.message) {
    return error.message;
  }

  return fallback;
};

export const getValidationDetails = (error) => error?.response?.data?.error?.details || null;
