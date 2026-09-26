import { prisma } from './config/prisma';
import { register } from './services/auth.service';

(async () => {
  try {
    await register('255700000001', 'Demo Passenger', 'Password123!', 'PASSENGER');
    await register('255700000002', 'Demo Driver', 'Password123!', 'DRIVER');
    await register('255700000000', 'Demo Admin', 'Password123!', 'ADMIN');
    console.log('seed complete');
  } catch (e) {
    console.log('seed skipped (accounts may already exist)');
  } finally {
    await prisma.$disconnect();
  }
})();
