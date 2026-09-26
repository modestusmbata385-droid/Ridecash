import { prisma } from '../config/prisma';

export async function requestSettlement(userId: string, amount: number, reference?: string) {
  const driver = await prisma.driver.findUnique({ where: { userId } });
  if (!driver) throw Error('Driver profile missing');
  if (amount <= 0) throw Error('Amount must be positive');
  return prisma.commissionPayment.create({ data: { driverId: driver.id, amount, reference, status: 'PENDING' } });
}

export async function myPayments(userId: string) {
  const driver = await prisma.driver.findUnique({ where: { userId } });
  if (!driver) throw Error('Driver profile missing');
  return prisma.commissionPayment.findMany({ where: { driverId: driver.id }, orderBy: { createdAt: 'desc' } });
}

export async function listPayments(status?: string) {
  return prisma.commissionPayment.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'asc' },
    include: { driver: { include: { user: { select: { id: true, name: true, phone: true } } } } },
  });
}

export async function approvePayment(id: string) {
  const payment = await prisma.commissionPayment.update({ where: { id }, data: { status: 'APPROVED' } });
  await prisma.driver.update({ where: { id: payment.driverId }, data: { debt: { decrement: payment.amount } } });
  return payment;
}

export async function rejectPayment(id: string) {
  return prisma.commissionPayment.update({ where: { id }, data: { status: 'REJECTED' } });
}
