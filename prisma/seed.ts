/// <reference lib="dom" />
import { PrismaClient } from '@prisma/client';
import { monotonicFactory } from 'ulid';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const ulid = monotonicFactory();

async function seed() {
  try {
    await seedCountries();
    await seedSdgs();
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

async function seedSdgs() {
  const sdgs = await getSdgs();
  for (const sdg of sdgs) {
    await prisma.sdg.create({
      data: {
        id: ulid().toString(),
        ...sdg,
      },
    });
  }
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

async function getSdgs(): Promise<any[]> {
  return [
    { number: 1, name: 'No Poverty' },
    { number: 2, name: 'Zero Hunger' },
    { number: 3, name: 'Good Health and Well-being' },
    { number: 4, name: 'Quality Education' },
    { number: 5, name: 'Sex equalities' },
    { number: 6, name: 'Clean Water and Sanitation' },
    { number: 7, name: 'Affordable and Clean Energy' },
    { number: 8, name: 'Decent Work and Economic Growth' },
    { number: 9, name: 'Industry, Innovation and Infrastructure' },
    { number: 10, name: 'Reduced Inequalities' },
    { number: 11, name: 'Sustainable Cities and Communities' },
    { number: 12, name: 'Responsible Consumption and Production' },
    { number: 13, name: 'Climate Action' },
    { number: 14, name: 'Life Below Water' },
    { number: 15, name: 'Life on Land' },
    { number: 16, name: 'Peace and Justice Strong Institutions' },
    { number: 17, name: 'Partnerships to achieve the Goal' },
  ];
}
