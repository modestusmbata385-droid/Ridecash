import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as s from '../services/kyc.service';

export async function submit(req: AuthRequest, res: Response) {
  try {
    res.status(201).json(await s.submitDocument(req.user!.id, req.body.type, req.body.url));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

export async function mine(req: AuthRequest, res: Response) {
  try {
    res.json(await s.myDocuments(req.user!.id));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    res.json(await s.listDocuments(req.query.status as string | undefined));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

export async function approve(req: AuthRequest, res: Response) {
  try {
    res.json(await s.approveDocument(req.params.id));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

export async function reject(req: AuthRequest, res: Response) {
  try {
    res.json(await s.rejectDocument(req.params.id));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}
