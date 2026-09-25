import { prisma } from '../lib/prisma.js';
import type { User } from '@prisma/client';
import { UserRole } from '@prisma/client';

export interface CreateUserInput {
  phone: string;
  name: string;
  role?: UserRole;
  email?: string;
  governorate?: string;
}

export const userRepository = {
  findByPhone(phone: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { phone } });
  },

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: CreateUserInput): Promise<User> {
    return prisma.user.create({ data });
  },

  upsertByPhone(phone: string, name: string): Promise<User> {
    return prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone, name, role: 'BUYER' },
    });
  },

  update(id: string, data: Partial<Pick<User, 'name' | 'email' | 'governorate' | 'avatar' | 'role'>>): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  },
};
