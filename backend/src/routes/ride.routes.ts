import { Router } from 'express';
import { auth, role } from '../middleware/auth';
import * as c from '../controllers/ride.controller';

const r = Router();
r.post('/', auth, role('PASSENGER'), c.create);
r.get('/mine', auth, c.mine);
r.get('/available', auth, role('DRIVER'), c.available);
r.get('/:id', auth, c.getOne);
r.get('/:id/candidates', auth, role('PASSENGER'), c.candidates);
r.post('/:id/accept', auth, role('DRIVER'), c.accept);
r.post('/:id/start', auth, role('DRIVER'), c.start);
r.post('/:id/complete', auth, role('DRIVER'), c.complete);
r.post('/:id/cancel', auth, c.cancel);
export default r;
