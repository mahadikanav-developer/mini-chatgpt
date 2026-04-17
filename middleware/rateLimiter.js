// Rate limiter for authentication

const loginAttempts = {};
const otpAttempts = {};

// Track login attempts
const trackLoginAttempt = (phoneOrEmail) => {
  if (!loginAttempts[phoneOrEmail]) {
    loginAttempts[phoneOrEmail] = {
      attempts: 0,
      lockedUntil: null
    };
  }

  const lockoutDuration = 15 * 60 * 1000; // 15 minutes
  
  // Check if already locked
  if (loginAttempts[phoneOrEmail].lockedUntil) {
    if (new Date() < loginAttempts[phoneOrEmail].lockedUntil) {
      const remainingTime = Math.ceil(
        (loginAttempts[phoneOrEmail].lockedUntil - new Date()) / 1000 / 60
      );
      return {
        locked: true,
        remainingMinutes: remainingTime
      };
    } else {
      // Lockout expired, reset
      loginAttempts[phoneOrEmail] = {
        attempts: 0,
        lockedUntil: null
      };
    }
  }

  // Increment attempts
  loginAttempts[phoneOrEmail].attempts += 1;

  // Lock after 5 attempts
  if (loginAttempts[phoneOrEmail].attempts >= 5) {
    loginAttempts[phoneOrEmail].lockedUntil = new Date(Date.now() + lockoutDuration);
    return {
      locked: true,
      message: "Too many login attempts. Try again in 15 minutes."
    };
  }

  return { locked: false };
};

// Reset login attempts on successful login
const resetLoginAttempts = (phoneOrEmail) => {
  delete loginAttempts[phoneOrEmail];
};

// Track OTP requests
const trackOTPRequest = (phoneOrEmail) => {
  if (!otpAttempts[phoneOrEmail]) {
    otpAttempts[phoneOrEmail] = {
      count: 0,
      resetTime: Date.now() + 60 * 60 * 1000 // 1 hour
    };
  }

  // Reset if time expired
  if (Date.now() > otpAttempts[phoneOrEmail].resetTime) {
    otpAttempts[phoneOrEmail] = {
      count: 0,
      resetTime: Date.now() + 60 * 60 * 1000
    };
  }

  // Check limit (max 3 OTPs per hour)
  if (otpAttempts[phoneOrEmail].count >= 3) {
    const remainingMinutes = Math.ceil(
      (otpAttempts[phoneOrEmail].resetTime - Date.now()) / 1000 / 60
    );
    return {
      limited: true,
      message: `Too many OTP requests. Try again in ${remainingMinutes} minutes.`
    };
  }

  otpAttempts[phoneOrEmail].count += 1;
  return { limited: false };
};

module.exports = {
  trackLoginAttempt,
  resetLoginAttempts,
  trackOTPRequest
};
