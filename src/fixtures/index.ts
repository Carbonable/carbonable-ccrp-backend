import { PrismaClient, Prisma, CarbonCreditType, CarbonCreditOrigin, ProjectColor, CarbonCreditAuditStatus } from "@prisma/client";
import { LasDeliciasCurvePoints, LasDeliciasCarbonCredits } from "./las-delicias";
import { BanegasFarmCurvePoints, BanegasFarmCarbonCredits } from "./banegas-farm";
import { monotonicFactory } from 'ulid';
import { faker } from '@faker-js/faker';
import slugify from 'slugify';

let ulid = monotonicFactory();

let prismaClient = new PrismaClient();

type Reference<T> = {
    name: string,
    value: T,
};

type DataFixturesModelFnInput<T> = {
    connection: PrismaClient,
    references: Array<Reference<T>>,
};

type DataFixture<T, U> = {
    name: string,
    count: number,
    object: U,
    model: (input: DataFixturesModelFnInput<T>) => Promise<T>,
    data: Array<T>,
};

// @ts-ignore
let CertifierDataFixtures: DataFixture<Omit<Prisma.CertifierCreateManyInput, 'id'>, Prisma.CertifierDelegate<Prisma.RejectOnNotFound, Prisma.CertifierArgs>> = {
    name: 'certifier',
    count: 10,
    object: prismaClient.certifier,
    model: async ({ }) => {
        let name = faker.company.name();
        return { name, slug: slugify(name.toLowerCase()) };
    },
    data: [
        { name: 'Wildsense', slug: 'Wildsense' },
    ],
};

// @ts-ignore
let CompanyDataFixtures: DataFixture<Prisma.CompanyCreateManyInput, Prisma.CompanyDelegate<Prisma.RejectOnNotFound, Prisma.CompanyArgs>> = {
    name: 'company',
    count: 0,
    object: prismaClient.company,
    data: [
        { id: '01H5739RTVV0JV8M3DAN0C10ME', name: 'Carbonable', slug: 'carbonable' },
    ],
};

// @ts-ignore
let CompanyEmissionDataFixtures: DataFixture<Omit<Prisma.CompanyEmissionCreateManyInput, 'id'>, Prisma.CompanyEmissionDelegate<Prisma.RejectOnNotFound, Prisma.CompanyEmissionArgs>> = {
    name: 'companyEmission',
    count: 0,
    object: prismaClient.companyEmission,
    data: [
        { year: '2023', emission: 150, target: 100, companyId: '01H5739RTVV0JV8M3DAN0C10ME' },
        { year: '2024', emission: 150, target: 100, companyId: '01H5739RTVV0JV8M3DAN0C10ME' },
        { year: '2025', emission: 150, target: 100, companyId: '01H5739RTVV0JV8M3DAN0C10ME' },
        { year: '2026', emission: 150, target: 100, companyId: '01H5739RTVV0JV8M3DAN0C10ME' },
        { year: '2027', emission: 150, target: 100, companyId: '01H5739RTVV0JV8M3DAN0C10ME' },
        { year: '2028', emission: 150, target: 100, companyId: '01H5739RTVV0JV8M3DAN0C10ME' },
        { year: '2029', emission: 150, target: 100, companyId: '01H5739RTVV0JV8M3DAN0C10ME' },
        { year: '2030', emission: 150, target: 100, companyId: '01H5739RTVV0JV8M3DAN0C10ME' },
        { year: '2031', emission: 150, target: 100, companyId: '01H5739RTVV0JV8M3DAN0C10ME' },
        { year: '2032', emission: 150, target: 100, companyId: '01H5739RTVV0JV8M3DAN0C10ME' },
    ],
};

// @ts-ignore
let DevelopperDataFixtures: DataFixture<Prisma.DevelopperCreateManyInput, Prisma.DevelopperDelegate<Prisma.RejectOnNotFound, Prisma.DevelopperArgs>> = {
    name: 'developper',
    count: 0,
    object: prismaClient.developper,
    data: [
        { id: '00H5739MT3KXJ3RBQAATGWQ0RR', name: 'Fundacion Naturaleza Panama', slug: 'fundacion-naturaleza-panama' },
        { id: '01H5739RV1QHJCSE2GQTJ9B8PX', name: 'Corcovado Foundation', slug: 'corcovado-foundation' },
    ],
};

// @ts-ignore
let SdgDataFixtures: DataFixture<Omit<Prisma.SdgCreateManyInput, 'id'>, Prisma.SdgDelegate<Prisma.RejectOnNotFound, Prisma.SdgArgs>> = {
    name: 'sdg',
    count: 0,
    object: prismaClient.sdg,
    model: async () => ({ number: 1, name: 'No Poverty' }),
    data: [
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
    ],
};

// @ts-ignore
let ProjectDataFixtures: DataFixture<Prisma.ProjectCreateManyInput, Prisma.ProjectDelegate<Prisma.RejectOnNotFound, Prisma.ProjectArgs>> = {
    name: 'project',
    count: 0,
    object: prismaClient.project,
    // model: async ({ references }) => {
    //     // @ts-ignore
    //     let developperId = faker.helpers.arrayElement(references['developper']).id;
    //     // @ts-ignore
    //     let certifierId = faker.helpers.arrayElement(references['certifier']).id;
    //     // @ts-ignore
    //     let countryId = faker.helpers.arrayElement(references['country']).id;
    //     let startDate = faker.date.past().getFullYear();
    //     let endDate = faker.date.future({ years: 30 }).getFullYear();
    //
    //     return {
    //         name: faker.word.sample({ length: { min: 1, max: 5 } }),
    //         type: faker.helpers.arrayElement([CarbonCreditType.RESTORATION, CarbonCreditType.CONCERVATION]),
    //         origin: faker.helpers.arrayElement([CarbonCreditOrigin.DIRECT_PURCHASE, CarbonCreditOrigin.FORWARD_FINANCE]),
    //         startDate: startDate.toString(),
    //         endDate: endDate.toString(),
    //         area: parseInt(faker.string.numeric(5)),
    //         description: faker.lorem.paragraph(),
    //         localization: `${faker.location.latitude()}, ${faker.location.longitude()}`,
    //         fundingAmount: faker.number.int({ min: 300_000, max: 3_000_000 }),
    //         color: faker.helpers.arrayElement([ProjectColor.GREEN, ProjectColor.ORANGE, ProjectColor.BLUE]),
    //         protectedForest: parseInt(faker.string.numeric(5)),
    //         protectedSpecies: parseInt(faker.string.numeric(2)),
    //         allocation: parseInt(faker.string.numeric(2)),
    //         developperId,
    //         certifierId,
    //         countryId,
    //     };
    // },
    data: [
        {
            id: '01H5739RVDH5MFVTHD90TBR92J',
            name: 'Banegas Farm',
            description: 'the Banegas site is a patch of dirt and shrubs that was degraded over time due to overgrazing.',
            localization: '8.701643683464424, -83.5534715922547',
            startDate: '2022',
            endDate: '2052',
            area: 0.0250,
            type: CarbonCreditType.RESTORATION,
            origin: CarbonCreditOrigin.FORWARD_FINANCE,
            fundingAmount: 17600,
            color: ProjectColor.GREEN,
            protectedForest: parseInt(faker.string.numeric(5)),
            protectedSpecies: parseInt(faker.string.numeric(2)),
            allocation: parseInt(faker.string.numeric(2)),
            developperId: '01H5739RV1QHJCSE2GQTJ9B8PX',
            companyId: '01H5739RTVV0JV8M3DAN0C10ME',
            // @ts-ignore
            certifierId: (references: any) => {
                // @ts-ignore
                return references['certifier'].find((c) => c.name === 'Wildsense').id;
            },
            // @ts-ignore
            countryId: (references: any) => {
                // @ts-ignore
                return references['country'].find((c) => c.name === 'Costa Rica').id;
            }
        },
        {
            id: '01H5739RVSRKHFVNM47AE4NHMK',
            name: 'Las Delicias',
            description: 'Las Delicias is a mangrove restoration project located right outside of the municipality of Colón Island in the Bocas del Toro archipiélago, Panama.',
            localization: '9.402630368441974, -82.30576308181759',
            startDate: '2022',
            endDate: '2042',
            area: 0.0500,
            type: CarbonCreditType.RESTORATION,
            origin: CarbonCreditOrigin.FORWARD_FINANCE,
            fundingAmount: 39600,
            color: ProjectColor.GREEN,
            protectedForest: parseInt(faker.string.numeric(5)),
            protectedSpecies: parseInt(faker.string.numeric(2)),
            allocation: parseInt(faker.string.numeric(2)),
            developperId: '00H5739MT3KXJ3RBQAATGWQ0RR',
            companyId: '01H5739RTVV0JV8M3DAN0C10ME',
            // @ts-ignore
            certifierId: (references: any) => {
                // @ts-ignore
                return references['certifier'].find((c) => c.name === 'Wildsense').id;
            },
            // @ts-ignore
            countryId: (references: any) => {
                // @ts-ignore
                return references['country'].find((c) => c.name === 'Panama').id;
            }
        },
    ],
};

// @ts-ignore
let CurvePointDataFixtures: DataFixture<Omit<Prisma.CurvePointCreateManyInput, 'id'>, Prisma.CurvePointDelegate<Prisma.RejectOnNotFound, Prisma.CurvePointArgs>> = {
    name: 'curvePoint',
    count: 0,
    object: prismaClient.curvePoint,
    data: [...LasDeliciasCurvePoints, ...BanegasFarmCurvePoints],
};

let ProjectsSdgsDataFixtures: DataFixture<Omit<Prisma.ProjectsSdgsCreateManyInput, 'id'>, Prisma.ProjectsSdgsDelegate> = {
    name: 'projectSdgs',
    count: 1,
    object: prismaClient.projectsSdgs,
    // @ts-ignore
    model: async function*({ references }) {
        let projects = references['project'];
        let sdgs = references['sdg'];

        for (let project of projects) {
            let linkedSdgs = faker.helpers.arrayElements(sdgs);
            for (let sdg of linkedSdgs) {
                yield {
                    projectId: project.id,
                    // @ts-ignore
                    sdgId: sdg.id,
                }
            }
        }
    },
    data: [],
};

// @ts-ignore
let CarbonCreditsDataFixtures: DataFixture<Omit<Prisma.CarbonCreditCreateManyInput, 'id'>, Prisma.CarbonCreditDelegate<Prisma.RejectOnNotFound, Prisma.CarbonCreditArgs>> = {
    name: 'carbonCredit',
    count: 0,
    object: prismaClient.carbonCredit,
    data: [...LasDeliciasCarbonCredits, ...BanegasFarmCarbonCredits],
}

function addId(name: string, object: any) {
    if ('projectSdgs' === name || object.hasOwnProperty('id')) {
        return object;
    }

    return {
        ...object, id: ulid().toString(),
    }
}

function resolveReferences(object: any, references: Array<any>) {
    for (let [key, value] of Object.entries(object)) {
        if ('function' !== typeof value) {
            continue;
        }

        object[key] = value(references);
    }

    return object;
}

async function addFixtures({ connection }) {
    let fixturesManagers = [
        CertifierDataFixtures,
        CompanyDataFixtures,
        CompanyEmissionDataFixtures,
        DevelopperDataFixtures,
        SdgDataFixtures,
        ProjectDataFixtures,
        ProjectsSdgsDataFixtures,
        CurvePointDataFixtures,
        CarbonCreditsDataFixtures,
    ];

    let references = [];

    let countries = await prismaClient.country.findMany({ select: { id: true, name: true } });
    references['country'] = countries;

    for (let fixture of fixturesManagers) {
        references[fixture.name] = [];

        if (0 !== fixture.data.length) {
            let txData = [];
            for (let d of fixture.data) {
                d = addId(fixture.name, d);
                d = resolveReferences(d, references);
                references[fixture.name].push(d);
                txData = [...txData, d];
            }
            // @ts-ignore
            await fixture.object.createMany({ data: txData });
        }

        let fixturesData = [];
        let batchSize = 100;
        for (let count = fixture.data.length; count < fixture.count + fixture.data.length; count++) {
            let item = await fixture.model({ connection, references });
            if (fixture.model.constructor.name === 'AsyncGeneratorFunction') {
                // @ts-ignore
                for await (let i of item) {
                    i = addId(fixture.name, i);
                    fixturesData = [...fixturesData, i];
                }

                fixturesData = await flush(fixture, count, batchSize, fixturesData);

                continue;
            }

            item = addId(fixture.name, item);
            references[fixture.name].push(item);
            fixturesData = [...fixturesData, item];

            fixturesData = await flush(fixture, count, batchSize, fixturesData);
        }

        try {
            // @ts-ignore
            await fixture.object.createMany({ data: fixturesData });
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

}

async function flush<F, T>(fixture: F, count: number, batchSize: number, data: Array<T>): Promise<Array<T>> {
    if (count % batchSize === 0) {
        // @ts-ignore
        await fixture.object.createMany({ data });
        return [];
    }
    return data;
}

async function seedCountries() {
    let countries = await getCountries();
    for (let country of countries) {
        await prismaClient.country.create({
            data: {
                id: ulid().toString(),
                name: country.name.common,
                code: country.cca2,
                data: country,
            },
        });
    }
}

async function getCountries(): Promise<any[]> {
    let res = await fetch('https://raw.githubusercontent.com/mledoze/countries/master/countries.json');
    return await res.json();
}


(async () => {
    try {
        let connection = await prismaClient.$connect()

        await seedCountries();
        await addFixtures({ connection });

        console.log("Fixtures added successfully");

    } catch (e) {
        console.error(e);
    } finally {
        await prismaClient.$disconnect();
    }
})();
