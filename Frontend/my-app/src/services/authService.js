const API_BASE_URL = "http://localhost:8080/api/auth";

export const signUpUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create account");
    }

    return data;
  } catch (error) {
    if (error.message === "Failed to fetch") {
      throw new Error(
        "Unable to connect to server. Please check your connection."
      );
    }
    throw error;
  }
};

export const fetchUserDetails = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${email}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user details");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user details: ", error);
    throw error;
  }
};

export const getUsername = () => {
  return localStorage.getItem("username");
};

export const updateUsername = (newUsername) => {
  localStorage.setItem("username", newUsername);
};

export const storeUserDetails = (userDetails) => {
  localStorage.setItem("username", userDetails.username);
  //Store other details if needed
};

export const signInUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Login failed");
    }

    const data = await response.json();

    //Store token and email
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("userEmail", credentials.email);

    //Fetch and store username
    try {
      const userDetails = await fetchUserDetails(credentials.email);
      storeUserDetails(userDetails);
    } catch (error) {
      console.error("Error fetching username:", error);
      //Store email prefix as fallback
      localStorage.setItem("username", credentials.email.split("@")[0]);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Password reset functions
export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send OTP");
    }

    return data;
  } catch (error) {
    if (error.message === "Failed to fetch") {
      throw new Error(
        "Unable to connect to server. Please check your connection."
      );
    }
    throw error;
  }
};

export const resetPassword = async (resetData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resetData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to reset password");
    }

    return data;
  } catch (error) {
    if (error.message === "Failed to fetch") {
      throw new Error(
        "Unable to connect to server. Please check your connection."
      );
    }
    throw error;
  }
};

// [FIX]: Update isAuthenticated to check localStorage instead of window
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

// [FIX]: Add this new function to check and return auth state
export const checkAuth = () => {
  return {
    isAuthenticated: !!localStorage.getItem('authToken'),
    userEmail: localStorage.getItem('userEmail'),
    username: localStorage.getItem('username')
  };
};

export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

export const getUserEmail = () => {
  return localStorage.getItem("userEmail");
};

//Logout Function
export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("username");
};