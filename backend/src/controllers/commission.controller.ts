import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as s from '../services/commission.service';

export async function create(req: AuthRequest, res: Response) {
  try {
    res.status(201).json(await s.requestSettlement(req.user!.id, Number(req.body.amount), req.body.reference));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

export async function mine(req: AuthRequest, res: Response) {
  try {
    res.json(await s.myPayments(req.user!.id));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}
