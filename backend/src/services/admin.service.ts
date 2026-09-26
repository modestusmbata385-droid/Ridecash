import { prisma } from '../config/prisma';

export async function stats() {
  const [totalDrivers, pendingKyc, pendingPayments, totalRides, ridesToday, activeRides] = await Promise.all([
    prisma.driver.count(),
    prisma.driver.count({ where: { kycStatus: 'PENDING' } }),
    prisma.commissionPayment.count({ where: { status: 'PENDING' } }),
    prisma.ride.count(),
    prisma.ride.count({ where: { requestedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    prisma.ride.count({ where: { status: { in: ['REQUESTED', 'ACCEPTED', 'ARRIVING', 'STARTED'] } } }),
  ]);
  const debtAgg = await prisma.driver.aggregate({ _sum: { debt: true } });
  return {
    totalDrivers,
    pendingKyc,
    pendingPayments,
    totalRides,
    ridesToday,
    activeRides,
    totalOutstandingDebt: debtAgg._sum.debt || 0,
  };
}

export async function listDrivers() {
  return prisma.driver.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, name: true, phone: true, createdAt: true } } },
  });
}

export async function setDriverStatus(id: string, status: 'APPROVED' | 'SUSPENDED' | 'PENDING') {
  return prisma.driver.update({ where: { id }, data: { status } });
}

export async function listRides(limit = 100) {
  return prisma.ride.findMany({
    orderBy: { requestedAt: 'desc' },
    take: limit,
    include: {
      passenger: { select: { id: true, name: true, phone: true } },
      driver: { include: { user: { select: { id: true, name: true, phone: true } } } },
    },
  });
}
