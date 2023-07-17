import { PrismaClient, Prisma, CarbonCreditType, CarbonCreditOrigin, ProjectColor } from "@prisma/client";
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
        { name: 'Vera', slug: 'vera' },
        { name: 'Wildsense', slug: 'Wildsense' },
    ],
};
// @ts-ignore
let DevelopperDataFixtures: DataFixture<Omit<Prisma.DevelopperCreateManyInput, 'id'>, Prisma.DevelopperDelegate<Prisma.RejectOnNotFound, Prisma.DevelopperArgs>> = {
    name: 'developper',
    count: 10,
    object: prismaClient.developper,
    model: async ({ }) => {
        let name = faker.company.name();
        return { name, slug: slugify(name.toLowerCase()) };
    },
    data: [],
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
let ProjectDataFixtures: DataFixture<Omit<Prisma.ProjectCreateManyInput, 'id'>, Prisma.ProjectDelegate<Prisma.RejectOnNotFound, Prisma.ProjectArgs>> = {
    name: 'project',
    count: 20,
    object: prismaClient.project,
    model: async ({ references }) => {
        // @ts-ignore
        let developperId = faker.helpers.arrayElement(references['developper']).id;
        // @ts-ignore
        let certifierId = faker.helpers.arrayElement(references['certifier']).id;
        // @ts-ignore
        let countryId = faker.helpers.arrayElement(references['country']).id;
        let startDate = faker.date.past().getFullYear();
        let endDate = faker.date.future({ years: 30 }).getFullYear();

        return {
            name: faker.word.sample({ length: { min: 1, max: 5 } }),
            type: faker.helpers.arrayElement([CarbonCreditType.RESTORATION, CarbonCreditType.CONCERVATION]),
            origin: faker.helpers.arrayElement([CarbonCreditOrigin.DIRECT_PURCHASE, CarbonCreditOrigin.FORWARD_FINANCE]),
            startDate: startDate.toString(),
            endDate: endDate.toString(),
            area: parseInt(faker.string.numeric(5)),
            description: faker.lorem.paragraph(),
            localization: `${faker.location.latitude()}, ${faker.location.longitude()}`,
            fundingAmount: faker.number.int({ min: 300_000, max: 3_000_000 }),
            color: faker.helpers.arrayElement([ProjectColor.GREEN, ProjectColor.ORANGE, ProjectColor.BLUE]),
            protectedForest: parseInt(faker.string.numeric(5)),
            protectedSpecies: parseInt(faker.string.numeric(2)),
            allocation: parseInt(faker.string.numeric(2)),
            developperId,
            certifierId,
            countryId,
        };
    },
    data: [],
};

// @ts-ignore
let ProjectConfigurationDataFixtures: DataFixture<Omit<Prisma.ProjectConfigurationCreateManyInput, 'id'>, Prisma.ProjectConfigurationDelegate<Prisma.RejectOnNotFound, Prisma.ProjectConfigurationArgs>> = {
    name: 'projectConfiguration',
    count: 1,
    object: prismaClient.projectConfiguration,
    // @ts-ignore
    model: async function*({ references }) {
        let projects = references['project'];

        for (let project of projects) {

            let startDate = parseInt(project.startDate);
            let diff = parseInt(project.endDate) - startDate;
            for (let i = 0; i < diff; i++) {
                yield {
                    id: ulid().toString(),
                    year: (startDate + i).toString(),
                    emission: parseInt(faker.string.numeric(3)),
                    target: parseInt(faker.string.numeric(2)),
                    projectId: project.id,
                    certifierId: project.certifierId,
                };
            }
        }
    },
    data: [],
};

// @ts-ignore
let CurvePointDataFixtures: DataFixture<Omit<Prisma.CurvePointCreateManyInput, 'id'>, Prisma.CurvePointDelegate<Prisma.RejectOnNotFound, Prisma.CurvePointArgs>> = {
    name: 'curvePoint',
    count: 1,
    object: prismaClient.curvePoint,
    // @ts-ignore
    model: async function*({ references }) {
        let projects = references['project'];

        for (let project of projects) {

            let startDate = parseInt(project.startDate);
            let diff = parseInt(project.endDate) - startDate;

            let date = new Date(project.startDate);

            for (let i = 0; i < diff; i++) {
                let timeCopy = new Date(date).setFullYear(date.getFullYear() + i)
                let time = new Date(timeCopy);
                yield {
                    id: ulid().toString(),
                    time: time,
                    absorption: 1000 * i,
                    projectId: project.id,
                };
            }
        }
    },
    data: [],
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
    count: 100000,
    object: prismaClient.carbonCredit,
    model: async ({ references }) => {
        let project = faker.helpers.arrayElement(references['project']);
        let isPurchased = faker.datatype.boolean({ probability: 0.2 });
        let purchasePrice = isPurchased ? faker.number.int({ min: 20, max: 150 }) : null;

        return {
            // @ts-ignore
            type: project.type,
            // @ts-ignore
            origin: project.origin,
            number: ulid().toString(),
            // @ts-ignore
            vintage: faker.helpers.rangeToNumber(parseInt(project.startDate), parseInt(project.endDate)).toString(),
            isRetired: faker.datatype.boolean(),
            isLocked: faker.datatype.boolean(),
            isPurchased,
            purchasePrice,
            // @ts-ignore
            projectId: project.id,
        }
    },
    data: [],
}

function addId(name: string, object: any) {
    if ('projectSdgs' === name) {
        return object;
    };
    return {
        ...object, id: ulid().toString(),
    }
}
async function addFixtures({ connection }) {
    let fixturesManagers = [
        CertifierDataFixtures,
        DevelopperDataFixtures,
        SdgDataFixtures,
        ProjectDataFixtures,
        ProjectConfigurationDataFixtures,
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
