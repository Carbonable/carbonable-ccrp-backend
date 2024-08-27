/// <reference lib="dom" />
import { PrismaClient } from '@prisma/client';
import { monotonicFactory } from 'ulid';

const prisma = new PrismaClient();
const ulid = monotonicFactory();

async function seed() {
  try {
    await seedCountries();
    await seedSdgs();
    await seedInitCompany();
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

async function seedInitCompany() {
  const { id, name, slug } = await getInitCompany();
  await prisma.company.create({
    data: {
      id,
      name,
      slug,
    },
  });
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
async function getInitCompany(): Promise<any> {
  return {
    id: '1',
    name: 'Company name to change',
    slug: 'Company-name-to-change',
  };
}
