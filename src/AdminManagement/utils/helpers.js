/**
 * Helper function to build image URL
 */
import { API_BASE_URL_FULL } from '../constants/api';

export const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  if (imagePath.startsWith('/')) {
    return `${API_BASE_URL_FULL}${imagePath}`;
  }
  return `${API_BASE_URL_FULL}/${imagePath}`;
};

/**
 * Helper function to extract error message from API response
 */
export const getErrorMessage = (error) => {
  if (!error?.response?.data) {
    return 'An error occurred. Please try again.';
  }

  const errorData = error.response.data;

  if (errorData.message) {
    return errorData.message;
  }

  if (errorData.error) {
    return errorData.error;
  }

  if (errorData.errors) {
    const errorMessages = [];
    Object.keys(errorData.errors).forEach(key => {
      if (Array.isArray(errorData.errors[key])) {
        errorMessages.push(...errorData.errors[key]);
      } else {
        errorMessages.push(errorData.errors[key]);
      }
    });
    if (errorMessages.length > 0) {
      return errorMessages.join('\n');
    }
  }

  return 'An error occurred. Please try again.';
};

/**
 * Helper function to format form data for API
 */
export const createFormData = (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => formData.append(`${key}[]`, item));
      } else if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value);
      }
    }
  });
  return formData;
};

/**
 * Helper function to validate password
 */
export const validatePassword = (password, minLength = 6) => {
  if (!password || password.trim().length < minLength) {
    return `Password must be at least ${minLength} characters long.`;
  }
  return null;
};

/**
 * Helper function to check if passwords match
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return null;
};

