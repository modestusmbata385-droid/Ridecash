import { Request, Response } from 'express';
import * as s from '../services/otp.service';
import { signToken } from '../utils/auth';

export async function request(req: Request, res: Response) {
  try {
    res.json(await s.requestOtp(req.body.phone));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

export async function verify(req: Request, res: Response) {
  try {
    const result = await s.verifyOtp(req.body.phone, req.body.code);
    if (result.user) {
      const token = signToken(result.user.id, result.user.role);
      return res.json({ verified: true, token, user: result.user });
    }
    res.json({ verified: true, user: null });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}
