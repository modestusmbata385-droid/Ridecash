import { Router } from 'express';
import { auth } from '../middleware/auth';
import * as c from '../controllers/safety.controller';

const r = Router();
r.post('/reports', auth, c.create);
export default r;
