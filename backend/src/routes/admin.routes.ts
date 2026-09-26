import { Router } from 'express';
import { auth, role } from '../middleware/auth';
import * as c from '../controllers/admin.controller';

const r = Router();
r.use(auth, role('ADMIN'));

r.get('/stats', c.getStats);

r.get('/drivers', c.getDrivers);
r.post('/drivers/:id/suspend', c.suspendDriver);
r.post('/drivers/:id/activate', c.activateDriver);

r.get('/rides', c.getRides);

r.get('/kyc', c.getKycDocuments);
r.post('/kyc/:id/approve', c.approveKyc);
r.post('/kyc/:id/reject', c.rejectKyc);

r.get('/safety-reports', c.getSafetyReports);

r.get('/commission-payments', c.getCommissionPayments);
r.post('/commission-payments/:id/approve', c.approveCommissionPayment);
r.post('/commission-payments/:id/reject', c.rejectCommissionPayment);

export default r;
