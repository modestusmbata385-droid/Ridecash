import 'dotenv/config';
export const env={PORT:Number(process.env.PORT||4000),NODE_ENV:process.env.NODE_ENV||'development',JWT_SECRET:process.env.JWT_SECRET||'dev-secret',CORS_ORIGIN:process.env.CORS_ORIGIN||'*',DEBT_LIMIT:Number(process.env.DRIVER_DEBT_LIMIT_TZS||20000),COMMISSION_RATE:Number(process.env.COMMISSION_RATE||0.12),OTP_EXPIRY_MINUTES:Number(process.env.OTP_EXPIRY_MINUTES||5)};
