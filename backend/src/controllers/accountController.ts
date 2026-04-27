import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db';

const UpdateSchema = z.object({
  title: z.enum(['Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Ms.', 'Miss.']).optional(),
  name: z.string().min(1).max(100).trim().optional(),
  fullName: z.string().min(1).max(120).trim().optional(),
  block: z.string().min(1).max(20).optional(),
  floor: z.enum(['2nd', '3rd', '4th', '5th', '6th', '9th']).optional(),
  cabinPosition: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).nullable().optional(),
  photoDataUrl: z.string().nullable().optional(),
  linkedFacultyId: z.number().int().positive().nullable().optional(),
});

function sanitize(account: { pinHash: string; [key: string]: unknown }) {
  const { pinHash: _, ...safe } = account;
  return safe;
}

export async function linkedIds(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const accounts = await prisma.facultyAccount.findMany({
      where: { linkedFacultyId: { not: null } },
      select: { linkedFacultyId: true },
    });
    const linkedIds = accounts.map((a) => a.linkedFacultyId!);
    res.json({ linkedIds });
  } catch (err) {
    next(err);
  }
}

export async function listAccounts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const accounts = await prisma.facultyAccount.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ accounts: accounts.map(sanitize) });
  } catch (err) {
    next(err);
  }
}

export async function getAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const email = String(req.params.email).toLowerCase();
    const account = await prisma.facultyAccount.findUnique({ where: { email } });
    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }
    res.json({ account: sanitize(account) });
  } catch (err) {
    next(err);
  }
}

export async function updateAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const email = String(req.params.email).toLowerCase();

    if (req.user!.email !== email && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'You can only update your own account' });
      return;
    }

    const data = UpdateSchema.parse(req.body);
    const account = await prisma.facultyAccount.update({
      where: { email },
      data,
    });
    res.json({ account: sanitize(account) });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const email = String(req.params.email).toLowerCase();

    if (req.user!.email !== email && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'You can only delete your own account' });
      return;
    }

    await prisma.facultyAccount.delete({ where: { email } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
