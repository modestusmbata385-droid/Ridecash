import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as s from '../services/ride.service';

export async function create(req: AuthRequest, res: Response) {
  try { res.status(201).json(await s.createRide(req.user!.id, req.body)); }
  catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function candidates(req: AuthRequest, res: Response) {
  try { res.json(await s.findCandidateDrivers(req.params.id)); }
  catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function available(_req: AuthRequest, res: Response) {
  try { res.json(await s.availableRides()); }
  catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function accept(req: AuthRequest, res: Response) {
  try { res.json(await s.acceptRide(req.user!.id, req.params.id)); }
  catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function start(req: AuthRequest, res: Response) {
  try { res.json(await s.startRide(req.user!.id, req.params.id)); }
  catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function complete(req: AuthRequest, res: Response) {
  try { res.json(await s.completeRide(req.user!.id, req.params.id)); }
  catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function cancel(req: AuthRequest, res: Response) {
  try { res.json(await s.cancelRide(req.user!.id, req.user!.role, req.params.id)); }
  catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function getOne(req: AuthRequest, res: Response) {
  try { res.json(await s.getRide(req.user!.id, req.user!.role, req.params.id)); }
  catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function mine(req: AuthRequest, res: Response) {
  try { res.json(await s.myRides(req.user!.id, req.user!.role)); }
  catch (e: any) { res.status(400).json({ error: e.message }); }
}
