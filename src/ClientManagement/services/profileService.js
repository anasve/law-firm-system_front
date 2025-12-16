import { api } from './api';

export const profileService = {
  // Get profile
  getProfile: () => {
    return api.get('/profile');
  },

  // Update profile
  updateProfile: (data) => {
    // If image is a File object, use FormData
    if (data.image instanceof File) {
      const formData = new FormData();
      formData.append('name', data.name || '');
      formData.append('email', data.email || '');
      if (data.phone) formData.append('phone', data.phone);
      if (data.address) formData.append('address', data.address);
      formData.append('image', data.image);
      
      return api.post('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    // Otherwise, use regular JSON
    return api.put('/profile', data);
  },

  // Resend verification email
  resendVerification: () => {
    return api.post('/email/verification-notification');
  },
};

