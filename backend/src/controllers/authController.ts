import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db';
import { config } from '../config';

const RegisterSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  pin: z.string().length(4).regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
  title: z.enum(['Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Ms.', 'Miss.']),
  name: z.string().min(1).max(100).trim(),
  fullName: z.string().min(1).max(120).trim(),
  block: z.string().min(1).max(20),
  floor: z.enum(['2nd', '3rd', '4th', '5th', '6th', '9th']),
  cabinPosition: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
  photoDataUrl: z.string().optional(),
  linkedFacultyId: z.number().int().positive().optional(),
});

const LoginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  pin: z.string().length(4),
});

function signToken(email: string, role: string): string {
  return jwt.sign({ email, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = RegisterSchema.parse(req.body);

    const existing = await prisma.facultyAccount.findUnique({ where: { email: data.email } });
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const pinHash = await bcrypt.hash(data.pin, 10);

    const account = await prisma.facultyAccount.create({
      data: {
        email: data.email,
        pinHash,
        title: data.title,
        name: data.name,
        fullName: data.fullName,
        block: data.block,
        floor: data.floor,
        cabinPosition: data.cabinPosition,
        phone: data.phone,
        photoDataUrl: data.photoDataUrl,
        linkedFacultyId: data.linkedFacultyId,
        role: 'faculty',
      },
    });

    const token = signToken(account.email, account.role);
    res.status(201).json({ token, account: sanitize(account) });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, pin } = LoginSchema.parse(req.body);

    const account = await prisma.facultyAccount.findUnique({ where: { email } });
    if (!account) {
      res.status(401).json({ error: 'Invalid email or PIN' });
      return;
    }

    const valid = await bcrypt.compare(pin, account.pinHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or PIN' });
      return;
    }

    const token = signToken(account.email, account.role);
    res.json({ token, account: sanitize(account) });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const account = await prisma.facultyAccount.findUnique({
      where: { email: req.user!.email },
    });
    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }
    res.json({ account: sanitize(account) });
  } catch (err) {
    next(err);
  }
}

export async function changePin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schema = z.object({
      currentPin: z.string().length(4),
      newPin: z.string().length(4).regex(/^\d{4}$/, 'New PIN must be exactly 4 digits'),
    });
    const { currentPin, newPin } = schema.parse(req.body);

    const account = await prisma.facultyAccount.findUnique({ where: { email: req.user!.email } });
    if (!account) { res.status(404).json({ error: 'Account not found' }); return; }

    const valid = await bcrypt.compare(currentPin, account.pinHash);
    if (!valid) { res.status(401).json({ error: 'Current PIN is incorrect' }); return; }

    const pinHash = await bcrypt.hash(newPin, 10);
    await prisma.facultyAccount.update({ where: { email: req.user!.email }, data: { pinHash } });

    res.json({ message: 'PIN updated successfully' });
  } catch (err) {
    next(err);
  }
}

function sanitize(account: { pinHash: string; [key: string]: unknown }) {
  const { pinHash: _, ...safe } = account;
  return safe;
}
