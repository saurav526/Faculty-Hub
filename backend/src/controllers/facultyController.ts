import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';

export async function listFaculty(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, floor, block, remarkType, isHOD } = req.query;

    const faculty = await prisma.facultyRecord.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { name: { contains: String(search), mode: 'insensitive' as const } },
                { fullName: { contains: String(search), mode: 'insensitive' as const } },
              ],
            }
          : {}),
        ...(floor ? { floor: String(floor) } : {}),
        ...(block ? { block: String(block) } : {}),
        ...(remarkType ? { remarkType: String(remarkType) } : {}),
        ...(isHOD !== undefined ? { isHOD: isHOD === 'true' } : {}),
      },
      include: { statusOverride: true },
      orderBy: [{ floor: 'asc' }, { block: 'asc' }, { id: 'asc' }],
    });

    res.json({ faculty });
  } catch (err) {
    next(err);
  }
}

export async function getFaculty(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid faculty id' });
      return;
    }

    const faculty = await prisma.facultyRecord.findUnique({
      where: { id },
      include: { statusOverride: true },
    });

    if (!faculty) {
      res.status(404).json({ error: 'Faculty not found' });
      return;
    }

    res.json({ faculty });
  } catch (err) {
    next(err);
  }
}
