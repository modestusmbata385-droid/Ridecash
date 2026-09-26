import { prisma } from '../config/prisma';

export async function submitDocument(userId: string, type: string, url: string) {
  const driver = await prisma.driver.findUnique({ where: { userId } });
  if (!driver) throw Error('Driver profile missing');
  return prisma.kycDocument.create({ data: { driverId: driver.id, type, url } });
}

export async function myDocuments(userId: string) {
  const driver = await prisma.driver.findUnique({ where: { userId } });
  if (!driver) throw Error('Driver profile missing');
  return prisma.kycDocument.findMany({ where: { driverId: driver.id }, orderBy: { createdAt: 'desc' } });
}

export async function listDocuments(status?: string) {
  return prisma.kycDocument.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { createdAt: 'asc' },
    include: { driver: { include: { user: { select: { id: true, name: true, phone: true } } } } },
  });
}

export async function approveDocument(id: string) {
  const doc = await prisma.kycDocument.update({ where: { id }, data: { status: 'APPROVED' } });
  await prisma.driver.update({ where: { id: doc.driverId }, data: { kycStatus: 'APPROVED' } });
  return doc;
}

export async function rejectDocument(id: string) {
  const doc = await prisma.kycDocument.update({ where: { id }, data: { status: 'REJECTED' } });
  await prisma.driver.update({ where: { id: doc.driverId }, data: { kycStatus: 'REJECTED' } });
  return doc;
}
