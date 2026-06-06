/**
 * PAN & Aadhaar Verification Simulation Module
 * Simulates API calls for identity verification
 */

/**
 * Simulate PAN verification
 * Validates format and simulates an API call with delay
 */
export async function verifyPAN(panNumber) {
  const pan = panNumber.toUpperCase().trim();

  // Validate format first
  const formatRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  if (!formatRegex.test(pan)) {
    return {
      success: false,
      error: 'Invalid PAN format. Expected: ABCDE1234F',
    };
  }

  // Simulate API call with 1.5s delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Deterministic success for tests
      const isValid = true;

      if (isValid) {
        // Generate a mock name based on PAN
        const mockNames = [
          'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Gupta',
          'Vikram Singh', 'Neha Reddy', 'Suresh Iyer', 'Anitha Nair'
        ];
        const nameIndex = pan.charCodeAt(0) % mockNames.length;

        resolve({
          success: true,
          name: mockNames[nameIndex],
          pan: pan,
          status: 'VALID',
        });
      } else {
        resolve({
          success: false,
          error: 'PAN verification failed. Please check the number and try again.',
        });
      }
    }, 1500);
  });
}

/**
 * Simulate Aadhaar OTP send
 * Returns success/failure for OTP dispatch
 */
export async function sendAadhaarOTP(aadhaarNumber) {
  const cleaned = aadhaarNumber.replace(/\s/g, '');

  if (!/^\d{12}$/.test(cleaned)) {
    return {
      success: false,
      error: 'Invalid Aadhaar number. Must be 12 digits.',
    };
  }

  // Simulate API call with 2s delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'OTP sent to registered mobile number ending in ****' + cleaned.slice(-2),
        transactionId: 'TXN' + Date.now(),
      });
    }, 2000);
  });
}

/**
 * Simulate Aadhaar OTP verification
 * Accepts any 6-digit OTP for simulation
 */
export async function verifyAadhaarOTP(otp, transactionId) {
  if (!/^\d{6}$/.test(otp)) {
    return {
      success: false,
      error: 'OTP must be 6 digits',
    };
  }

  // Simulate verification with 1.5s delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Aadhaar verified successfully',
        name: 'Verified User',
        maskedAadhaar: 'XXXX-XXXX-' + otp.slice(0, 4),
      });
    }, 1500);
  });
}

/**
 * Format Aadhaar number with spaces (XXXX XXXX XXXX)
 */
export function formatAadhaar(value) {
  const cleaned = value.replace(/\D/g, '').slice(0, 12);
  const parts = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    parts.push(cleaned.slice(i, i + 4));
  }
  return parts.join(' ');
}

/**
 * Format PAN number (uppercase)
 */
export function formatPAN(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
}
