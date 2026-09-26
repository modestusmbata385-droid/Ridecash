import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as s from '../services/safety.service';

export async function create(req: AuthRequest, res: Response) {
  try {
    res.status(201).json(await s.fileReport(req.user!.id, req.body.rideId, req.body.reason, req.body.details));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

export async function list(_req: AuthRequest, res: Response) {
  try {
    res.json(await s.listReports());
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}
