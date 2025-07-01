const API_BASE_URL = 'http://localhost:8080/api/auth';

export const signUpUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create account');
    }

    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please check your connection.');
    }
    throw error;
  }
};

export const signInUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to sign in');
    }

    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please check your connection.');
    }
    throw error;
  }
};

export const initiatePasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send OTP');
    }
  } catch (error) {
    console.error('Error initiating password reset:', error);
    throw error;
  }
};

export const resetPassword = async (email, otp, newPassword, confirmPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        otp,
        newPassword,
        confirmPassword
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to reset password');
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

export const isAuthenticated = () => {
  return window.authToken !== undefined;
};

export const getAuthToken = () => {
  return window.authToken;
};

export const logout = () => {
  delete window.authToken;
  delete window.userEmail;
};