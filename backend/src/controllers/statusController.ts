import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db';

const SetStatusSchema = z.object({
  status: z.enum(['available', 'in_class', 'away', 'on_leave']),
  note: z.string().max(200).optional(),
});

export async function listStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const overrides = await prisma.statusOverride.findMany({
      include: { faculty: { select: { id: true, fullName: true, block: true, floor: true } } },
    });
    res.json({ overrides });
  } catch (err) {
    next(err);
  }
}

export async function setStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const facultyId = parseInt(String(req.params.facultyId), 10);
    if (isNaN(facultyId)) {
      res.status(400).json({ error: 'Invalid faculty id' });
      return;
    }

    const { status, note } = SetStatusSchema.parse(req.body);

    const facultyExists = await prisma.facultyRecord.findUnique({ where: { id: facultyId } });
    if (!facultyExists) {
      res.status(404).json({ error: 'Faculty not found' });
      return;
    }

    const override = await prisma.statusOverride.upsert({
      where: { facultyId },
      update: { status, note: note ?? null, updatedBy: req.user!.email },
      create: { facultyId, status, note: note ?? null, updatedBy: req.user!.email },
    });

    res.json({ override });
  } catch (err) {
    next(err);
  }
}

export async function clearStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const facultyId = parseInt(String(req.params.facultyId), 10);
    if (isNaN(facultyId)) {
      res.status(400).json({ error: 'Invalid faculty id' });
      return;
    }

    await prisma.statusOverride.deleteMany({ where: { facultyId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function clearAllStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.statusOverride.deleteMany();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
