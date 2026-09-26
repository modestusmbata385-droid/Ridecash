import { Router } from 'express';
import * as c from '../controllers/otp.controller';

const r = Router();
r.post('/request', c.request);
r.post('/verify', c.verify);
export default r;
