import { Router } from 'express';
import { auth, role } from '../middleware/auth';
import * as c from '../controllers/commission.controller';

const r = Router();
r.post('/payments', auth, role('DRIVER'), c.create);
r.get('/payments/me', auth, role('DRIVER'), c.mine);
export default r;
