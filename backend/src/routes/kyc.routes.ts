import { Router } from 'express';
import { auth, role } from '../middleware/auth';
import * as c from '../controllers/kyc.controller';

const r = Router();
r.post('/documents', auth, role('DRIVER'), c.submit);
r.get('/documents/me', auth, role('DRIVER'), c.mine);
export default r;
