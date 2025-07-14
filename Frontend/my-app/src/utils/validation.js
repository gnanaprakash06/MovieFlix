export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }
  
  if (!email.trim()) {
    return 'Email is required';
  }
  
  // Check for spaces at the beginning
  if (email.startsWith(' ')) {
    return 'Email cannot start with spaces';
  }
  
  // Check for multiple @ symbols
  const atCount = (email.match(/@/g) || []).length;
  if (atCount > 1) {
    return 'Email cannot contain multiple @ symbols';
  }
  
  // Check for invalid special characters
  const invalidChars = /[,;*]/;
  if (invalidChars.test(email)) {
    return 'Email cannot contain special characters like , ; *';
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
  
  // Check for spaces
  if (/\s/.test(password)) {
    return 'Password cannot contain spaces';
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
  
  if (trimmedUsername.length > 15) {
    return 'Username must be less than 15 characters';
  }
  
  if (!/^[a-zA-Z]/.test(trimmedUsername)) {
    return 'Username must start with a letter';
  }
  
  // Check if username starts or ends with underscore
  if (trimmedUsername.startsWith('_') || trimmedUsername.endsWith('_')) {
    return 'Username cannot start or end with an underscore';
  }
  
  // Check for spaces
  if (/\s/.test(trimmedUsername)) {
    return 'Username cannot contain spaces';
  }
  
  // Check for invalid special characters (only letters, numbers, and underscores allowed)
  if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Confirm password is required';
  }
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null;
};