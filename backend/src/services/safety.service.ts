import { prisma } from '../config/prisma';

export async function fileReport(reporterId: string, rideId: string, reason: string, details?: string) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) throw Error('Ride not found');
  return prisma.safetyReport.create({ data: { rideId, reporterId, reason, details } });
}

export async function listReports() {
  return prisma.safetyReport.findMany({ orderBy: { createdAt: 'desc' } });
}
