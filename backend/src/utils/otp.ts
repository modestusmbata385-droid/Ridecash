import crypto from 'crypto';

export function generateOtpCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}
