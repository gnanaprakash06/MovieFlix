export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }
  
  if (!email.trim()) {
    return 'Email is required';
  }
  
  if (/^[0-9]/.test(email.trim())) {
    return 'Email cannot start with a number';
  }
  
  const emailRegex = /^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  
  if (!password.trim()) {
    return 'Password is required';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  if (!/(?=.*[!@#$%^&*])/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&*)';
  }
  
  return null;
};

export const validateUsername = (username) => {
  if (!username) {
    return 'Username is required';
  }
  
  if (!username.trim()) {
    return 'Username is required';
  }
  
  const trimmedUsername = username.trim();
  
  if (trimmedUsername.length < 3) {
    return 'Username must be at least 3 characters long';
  }
  
  if (trimmedUsername.length > 20) {
    return 'Username must be less than 20 characters';
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  
  if (!/^[a-zA-Z]/.test(trimmedUsername)) {
    return 'Username must start with a letter';
  }
  
  return null;
};