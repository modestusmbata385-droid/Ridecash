import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as adminService from '../services/admin.service';
import * as kycService from '../services/kyc.service';
import * as safetyService from '../services/safety.service';
import * as commissionService from '../services/commission.service';

export async function getStats(_req: AuthRequest, res: Response) {
  try { res.json(await adminService.stats()); } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function getDrivers(_req: AuthRequest, res: Response) {
  try { res.json(await adminService.listDrivers()); } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function suspendDriver(req: AuthRequest, res: Response) {
  try { res.json(await adminService.setDriverStatus(req.params.id, 'SUSPENDED')); } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function activateDriver(req: AuthRequest, res: Response) {
  try { res.json(await adminService.setDriverStatus(req.params.id, 'APPROVED')); } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function getRides(req: AuthRequest, res: Response) {
  try { res.json(await adminService.listRides(Number(req.query.limit) || 100)); } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function getKycDocuments(req: AuthRequest, res: Response) {
  try { res.json(await kycService.listDocuments(req.query.status as string | undefined)); } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function approveKyc(req: AuthRequest, res: Response) {
  try { res.json(await kycService.approveDocument(req.params.id)); } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function rejectKyc(req: AuthRequest, res: Response) {
  try { res.json(await kycService.rejectDocument(req.params.id)); } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function getSafetyReports(req: AuthRequest, res: Response) {
  try { res.json(await safetyService.listReports()); } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function getCommissionPayments(req: AuthRequest, res: Response) {
  try { res.json(await commissionService.listPayments(req.query.status as string | undefined)); } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function approveCommissionPayment(req: AuthRequest, res: Response) {
  try { res.json(await commissionService.approvePayment(req.params.id)); } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function rejectCommissionPayment(req: AuthRequest, res: Response) {
  try { res.json(await commissionService.rejectPayment(req.params.id)); } catch (e: any) { res.status(400).json({ error: e.message }); }
    }
