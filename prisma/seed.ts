/// <reference lib="dom" />
import { PrismaClient } from '@prisma/client';
import { monotonicFactory } from 'ulid';

let prisma = new PrismaClient();
let ulid = monotonicFactory();

async function seed() {
    let countries = await getCountries();
    for (let country of countries) {
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

seed().catch(async (e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => await prisma.$disconnect());


async function getCountries(): Promise<any[]> {
    let res = await fetch('https://raw.githubusercontent.com/mledoze/countries/master/countries.json');
    return await res.json();
}

