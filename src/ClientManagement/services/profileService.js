import { api } from './api';

export const profileService = {
  // Get profile
  getProfile: () => {
    return api.get('/profile');
  },

  // Update profile
  updateProfile: (data) => {
    return api.put('/profile', data);
  },

  // Resend verification email
  resendVerification: () => {
    return api.post('/email/verification-notification');
  },
};

