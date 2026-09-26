import { prisma } from '../config/prisma';
import { env } from '../config/env';

export async function createRide(passengerId: string, d: any) {
  return prisma.ride.create({
    data: {
      passengerId,
      pickupLat: d.pickupLat,
      pickupLng: d.pickupLng,
      destinationLat: d.destinationLat,
      destinationLng: d.destinationLng,
      pickupAddress: d.pickupAddress,
      destinationAddress: d.destinationAddress,
      fare: d.fare,
      paymentMethod: 'CASH',
    },
  });
}

export async function findCandidateDrivers(rideId: string) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) throw Error('Ride not found');
  return prisma.driver.findMany({
    where: { online: true, status: 'APPROVED', kycStatus: 'APPROVED', debt: { lt: env.DEBT_LIMIT } },
    orderBy: [{ points: 'desc' }, { lastSeen: 'desc' }],
    take: 10,
  });
}

export async function availableRides() {
  return prisma.ride.findMany({
    where: { status: 'REQUESTED', driverId: null },
    orderBy: { requestedAt: 'desc' },
    take: 20,
  });
}

export async function acceptRide(userId: string, rideId: string) {
  const driver = await prisma.driver.findUnique({ where: { userId } });
  if (!driver) throw Error('Driver profile missing');
  if (driver.status !== 'APPROVED' || driver.kycStatus !== 'APPROVED' || driver.debt >= env.DEBT_LIMIT) {
    throw Error('Driver cannot accept rides (approval, KYC or debt limit)');
  }
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride || ride.status !== 'REQUESTED' || ride.driverId) throw Error('Ride is no longer available');
  return prisma.ride.update({ where: { id: rideId }, data: { driverId: driver.id, status: 'ACCEPTED', acceptedAt: new Date() } });
}

export async function startRide(userId: string, rideId: string) {
  const driver = await prisma.driver.findUnique({ where: { userId } });
  if (!driver) throw Error('Driver profile missing');
  const ride = await prisma.ride.findFirst({ where: { id: rideId, driverId: driver.id, status: 'ACCEPTED' } });
  if (!ride) throw Error('Ride cannot be started');
  return prisma.ride.update({ where: { id: rideId }, data: { status: 'STARTED', startedAt: new Date() } });
}

export async function cancelRide(userId: string, role: string, rideId: string) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) throw Error('Ride not found');
  const isPassenger = role === 'PASSENGER' && ride.passengerId === userId;
  if (!isPassenger) throw Error('Only the passenger can cancel this ride');
  if (!['REQUESTED', 'ACCEPTED'].includes(ride.status)) throw Error('Ride can no longer be cancelled');
  return prisma.ride.update({ where: { id: rideId }, data: { status: 'CANCELLED' } });
}

export async function completeRide(userId: string, rideId: string) {
  const driver = await prisma.driver.findUnique({ where: { userId } });
  if (!driver) throw Error('Driver profile missing');
  const ride = await prisma.ride.findFirst({ where: { id: rideId, driverId: driver.id, status: 'STARTED' } });
  if (!ride) throw Error('Ride cannot be completed');
  const commission = Math.round(ride.fare * env.COMMISSION_RATE);
  await prisma.driver.update({ where: { id: driver.id }, data: { debt: { increment: commission }, points: { increment: 1 } } });
  return prisma.ride.update({ where: { id: rideId }, data: { status: 'COMPLETED', commission, completedAt: new Date() } });
}

export async function getRide(userId: string, role: string, rideId: string) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId }, include: { driver: { include: { user: { select: { name: true, phone: true } } } } } });
  if (!ride) throw Error('Ride not found');
  const driver = role === 'DRIVER' ? await prisma.driver.findUnique({ where: { userId } }) : null;
  const allowed = ride.passengerId === userId || (driver && ride.driverId === driver.id);
  if (!allowed) throw Error('Not authorized to view this ride');
  return ride;
}

export async function myRides(userId: string, role: string) {
  if (role === 'DRIVER') {
    const driver = await prisma.driver.findUnique({ where: { userId } });
    if (!driver) return [];
    return prisma.ride.findMany({ where: { driverId: driver.id }, orderBy: { requestedAt: 'desc' }, take: 20 });
  }
  return prisma.ride.findMany({ where: { passengerId: userId }, orderBy: { requestedAt: 'desc' }, take: 20 });
      }
