/// <reference lib="dom" />
import { PrismaClient } from '@prisma/client';
import { monotonicFactory } from 'ulid';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const ulid = monotonicFactory();

async function seed() {
  try {
    await seedCountries();
    await seedUsers();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seed()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());

async function seedCountries() {
  const countries = await getCountries();
  for (const country of countries) {
    await prisma.country.create({
      data: {
        id: ulid().toString(),
        name: country.name.common,
        code: country.cca2,
        data: country,
      },
    });
  }
}

async function seedUsers() {
  const data = await getAdmin();
  await prisma.user.create({
    data,
  });
}

async function getAdmin(): Promise<any> {
  const name = process.env.DEFAULT_ADMIN_NAME;
  const password = process.env.DEFAULT_ADMIN_PASSWORD;
  const rolesEnv = process.env.DEFAULT_ADMIN_ROLES;

  if (!rolesEnv || !name || !password) {
    throw new Error(
      'DEFAULT_ADMIN_NAME, DEFAULT_ADMIN_PASSWORD, or DEFAULT_ADMIN_ROLES are not defined in the environment variables',
    );
  }

  const adminExists = await prisma.user.findFirst({
    where: { roles: { has: 'admin' } },
  });

  if (!adminExists) {
    const roles = rolesEnv.replace(/[\[\]']/g, '').split(',');
    const CARBONABLE_SALT = parseInt(process.env.CARBONABLE_SALT);
    const hashedPassword = await bcrypt.hash(password, CARBONABLE_SALT);
    return {
      id: ulid().toString(),
      name,
      password: hashedPassword,
      roles,
    };
  }
}

async function getCountries(): Promise<any[]> {
  const res = await fetch(
    'https://raw.githubusercontent.com/mledoze/countries/master/countries.json',
  );
  return await res.json();
}
