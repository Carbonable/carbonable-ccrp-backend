import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CARBONABE_SALT } from './auth/constants';
import { Role } from './roles/role.enum';
import { ulid } from 'ulid';

const logger = new Logger('AuthManagement');

export async function bootstrapAuthAndUsers() {
  const prisma = new PrismaClient();
  logger.log('Checking if admin user exists...');

  const count = await prisma.user.count({
    where: {
      roles: {
        has: Role.Admin,
      },
    },
  });

  if (count === 0) {
    logger.log('No admin user found, creating default admin user...');

    const name = process.env.DEFAULT_ADMIN_NAME;
    const password = process.env.DEFAULT_ADMIN_PASSWORD;
    const rolesEnv = process.env.DEFAULT_ADMIN_ROLES;

    if (!rolesEnv || !name || !password) {
      throw new Error(
        'DEFAULT_ADMIN var is not defined in the environment variables',
      );
    }

    const roles = rolesEnv.replace(/[\[\]']/g, '').split(',');
    const hashedPassword = await bcrypt.hash(password, CARBONABE_SALT);

    await prisma.user.create({
      data: {
        id: ulid(),
        name,
        password: hashedPassword,
        roles,
      },
    });
    logger.log('Default admin user inserted into the user table.');
  } else {
    logger.log('User table already has admin set.');
  }

  await prisma.$disconnect();
}
