import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { generateOtpCode } from '../utils/otp';

export async function requestOtp(phone: string) {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);
  await prisma.otp.create({ data: { phone, code, expiresAt } });
  console.log(`[OTP] ${phone} -> ${code} (expires in ${env.OTP_EXPIRY_MINUTES}m)`);
  return {
    message: 'OTP generated',
    devCode: env.NODE_ENV === 'production' ? undefined : code,
  };
}

export async function verifyOtp(phone: string, code: string) {
  const otp = await prisma.otp.findFirst({
    where: { phone, code, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!otp) throw Error('Invalid or expired code');
  await prisma.otp.update({ where: { id: otp.id }, data: { used: true } });
  const user = await prisma.user.findUnique({ where: { phone } });
  return { verified: true, user: user ? { id: user.id, phone: user.phone, name: user.name, role: user.role } : null };
}

export async function wasPhoneRecentlyVerified(phone: string) {
  const otp = await prisma.otp.findFirst({
    where: { phone, used: true, createdAt: { gt: new Date(Date.now() - 15 * 60 * 1000) } },
    orderBy: { createdAt: 'desc' },
  });
  return !!otp;
                           }
