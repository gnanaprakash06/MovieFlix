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

export const fetchUserDetails = async (email) => {
  try{
    const response = await fetch(`${API_BASE_URL}/user/${email}`,{
      method: 'GET',
      headers: {
        'Content-Type':'application/json',
      },
    });

    if(!response.ok){
      throw new Error('Failed to fetch user details');
    }

    const data = await response.json();
    return data;
  }catch(error){
    console.error('Error fetching user details: ',error);
    throw error;
  }
};

export const getUsername = () => {
  return localStorage.getItem('username');
}

export const updateUsername = (newUsername) => {
  localStorage.setItem('username',newUsername);
}

export const storeUserDetails = (userDetails) => {
  localStorage.setItem('username', userDetails.username);
  //Store other details if needed
}

export const signInUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

      const data = await response.json();

      //Store token and email
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userEmail', credentials.email);

      //Fetch and store username
      try{
        const userDetails = await fetchUserDetails(credentials.email);
        storeUserDetails(userDetails);
      }catch(error){
        console.error('Error fetching username:',error);
        //Store email prefix as fallback
        localStorage.setItem('username',credentials.email.split('@')[0]);
      }

    return data;
  } catch (error) {
    // if (error.message === 'Failed to fetch') {
    //   throw new Error('Unable to connect to server. Please check your connection.');
    // }
    throw error;
  }
};

// export const initiatePasswordReset = async (email) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/forgot-password`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ email }),
//     });

//     const data = await response.json();  // Read the response body

//         if (!response.ok) {
//       throw new Error(data.error || 'Failed to send OTP');
//     }

//     return data;  // Return response body to your React code

//     // if (!response.ok) {
//     //   const errorData = await response.json();
//     //   throw new Error(errorData.error || 'Failed to send OTP');
//     // }
//   } catch (error) {
//     // console.error('Error initiating password reset:', error);
//      if (error.message === 'Failed to fetch') {
//       throw new Error('Unable to connect to server. Please check your connection.');
//     }
//     throw error;
//   }
// };

// export const resetPassword = async (email, otp, newPassword, confirmPassword) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/reset-password`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email,
//         otp,
//         newPassword,
//         confirmPassword
//       }),
//     });

//     // if (!response.ok) {
//     //   const errorData = await response.json();
//     //   throw new Error(errorData.error || 'Failed to reset password');
//     // }

//     const data = await response.json();  // Read response data

//     if (!response.ok) {
//       throw new Error(data.error || 'Failed to reset password');
//     }

//     return data;  // Return the response data

//   } catch (error) {
//     // console.error('Error resetting password:', error);
//      if (error.message === 'Failed to fetch') {
//       throw new Error('Unable to connect to server. Please check your connection.');
//     }
//     throw error;
//   }
// };

export const isAuthenticated = () => {
  return window.authToken !== undefined;
};

// export const getAuthToken = () => {
//   return window.authToken;
// };

export const getAuthToken = () =>{
  return localStorage.getItem('authToken');
}

export const getUserEmail = () => {
  return localStorage.getItem('userEmail');
}

// export const logout = () => {
//   delete window.authToken;
//   delete window.userEmail;
// };

//Logout Function
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('username');
}