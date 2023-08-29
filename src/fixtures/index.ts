import {
  PrismaClient,
  Prisma,
  CarbonCreditType,
  CarbonCreditOrigin,
  ProjectColor,
  Sdg,
  Project,
} from '@prisma/client';
import {
  LasDeliciasCurvePoints,
  LasDeliciasCarbonCredits,
} from './las-delicias';
import {
  BanegasFarmCurvePoints,
  BanegasFarmCarbonCredits,
} from './banegas-farm';
import { monotonicFactory } from 'ulid';
import { faker } from '@faker-js/faker';
import slugify from 'slugify';

const ulid = monotonicFactory();

const prismaClient = new PrismaClient();

type Reference<T> = {
  name: string;
  value: T;
};

type DataFixturesModelFnInput<T> = {
  connection: PrismaClient;
  references: Array<Reference<T>>;
};

type DataFixture<T, U> = {
  name: string;
  count: number;
  object: U;
  model?: (input: DataFixturesModelFnInput<T>) => Promise<T>;
  data: Array<T>;
};

const CertifierDataFixtures: DataFixture<
  Omit<Prisma.CertifierCreateManyInput, 'id'>,
  Prisma.CertifierDelegate
> = {
  name: 'certifier',
  count: 10,
  object: prismaClient.certifier,
  model: async ({}) => {
    const name = faker.company.name();
    return { name, slug: slugify(name.toLowerCase()) };
  },
  data: [{ name: 'Wildsense', slug: 'Wildsense' }],
};

const CompanyDataFixtures: DataFixture<
  Prisma.CompanyCreateManyInput,
  Prisma.CompanyDelegate
> = {
  name: 'company',
  count: 0,
  object: prismaClient.company,
  data: [
    {
      id: '01H5739RTVV0JV8M3DAN0C10ME',
      name: 'Carbonable',
      slug: 'carbonable',
    },
  ],
};

const CompanyEmissionDataFixtures: DataFixture<
  Omit<Prisma.CompanyEmissionCreateManyInput, 'id'>,
  Prisma.CompanyEmissionDelegate
> = {
  name: 'companyEmission',
  count: 0,
  object: prismaClient.companyEmission,
  data: [
    {
      year: '2023',
      emission: 150,
      target: 100,
      companyId: '01H5739RTVV0JV8M3DAN0C10ME',
    },
    {
      year: '2024',
      emission: 150,
      target: 100,
      companyId: '01H5739RTVV0JV8M3DAN0C10ME',
    },
    {
      year: '2025',
      emission: 150,
      target: 100,
      companyId: '01H5739RTVV0JV8M3DAN0C10ME',
    },
    {
      year: '2026',
      emission: 150,
      target: 100,
      companyId: '01H5739RTVV0JV8M3DAN0C10ME',
    },
    {
      year: '2027',
      emission: 150,
      target: 100,
      companyId: '01H5739RTVV0JV8M3DAN0C10ME',
    },
    {
      year: '2028',
      emission: 150,
      target: 100,
      companyId: '01H5739RTVV0JV8M3DAN0C10ME',
    },
    {
      year: '2029',
      emission: 150,
      target: 100,
      companyId: '01H5739RTVV0JV8M3DAN0C10ME',
    },
    {
      year: '2030',
      emission: 150,
      target: 100,
      companyId: '01H5739RTVV0JV8M3DAN0C10ME',
    },
    {
      year: '2031',
      emission: 150,
      target: 100,
      companyId: '01H5739RTVV0JV8M3DAN0C10ME',
    },
    {
      year: '2032',
      emission: 150,
      target: 100,
      companyId: '01H5739RTVV0JV8M3DAN0C10ME',
    },
  ],
};

const DevelopperDataFixtures: DataFixture<
  Prisma.DevelopperCreateManyInput,
  Prisma.DevelopperDelegate
> = {
  name: 'developper',
  count: 0,
  object: prismaClient.developper,
  data: [
    {
      id: '00H5739MT3KXJ3RBQAATGWQ0RR',
      name: 'Fundacion Naturaleza Panama',
      slug: 'fundacion-naturaleza-panama',
    },
    {
      id: '01H5739RV1QHJCSE2GQTJ9B8PX',
      name: 'Corcovado Foundation',
      slug: 'corcovado-foundation',
    },
  ],
};

const SdgDataFixtures: DataFixture<
  Omit<Prisma.SdgCreateManyInput, 'id'>,
  Prisma.SdgDelegate
> = {
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

const ProjectDataFixtures: DataFixture<
  Prisma.ProjectCreateManyInput,
  Prisma.ProjectDelegate
> = {
  name: 'project',
  count: 0,
  object: prismaClient.project,
  data: [
    {
      id: '01H5739RVDH5MFVTHD90TBR92J',
      name: 'Banegas Farm',
      description:
        'the Banegas site is a patch of dirt and shrubs that was degraded over time due to overgrazing.',
      localization: '8.701643683464424, -83.5534715922547',
      startDate: '2022',
      endDate: '2052',
      area: 0.025,
      type: CarbonCreditType.RESTORATION,
      origin: CarbonCreditOrigin.FORWARD_FINANCE,
      fundingAmount: 17600,
      color: ProjectColor.GREEN,
      protectedForest: parseInt(faker.string.numeric(5)),
      protectedSpecies: parseInt(faker.string.numeric(2)),
      allocation: parseInt(faker.string.numeric(2)),
      developperId: '01H5739RV1QHJCSE2GQTJ9B8PX',
      companyId: '01H5739RTVV0JV8M3DAN0C10ME',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      certifierId: (references: any) => {
        return references['certifier'].find((c: any) => c.name === 'Wildsense')
          .id;
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      countryId: (references: any) => {
        return references['country'].find((c) => c.name === 'Costa Rica').id;
      },
    },
    {
      id: '01H5739RVSRKHFVNM47AE4NHMK',
      name: 'Las Delicias',
      description:
        'Las Delicias is a mangrove restoration project located right outside of the municipality of Colón Island in the Bocas del Toro archipiélago, Panama.',
      localization: '9.402630368441974, -82.30576308181759',
      startDate: '2022',
      endDate: '2042',
      area: 0.05,
      type: CarbonCreditType.RESTORATION,
      origin: CarbonCreditOrigin.FORWARD_FINANCE,
      fundingAmount: 39600,
      color: ProjectColor.GREEN,
      protectedForest: parseInt(faker.string.numeric(5)),
      protectedSpecies: parseInt(faker.string.numeric(2)),
      allocation: parseInt(faker.string.numeric(2)),
      developperId: '00H5739MT3KXJ3RBQAATGWQ0RR',
      companyId: '01H5739RTVV0JV8M3DAN0C10ME',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      certifierId: (references: any) => {
        return references['certifier'].find((c) => c.name === 'Wildsense').id;
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      countryId: (references: any) => {
        return references['country'].find((c) => c.name === 'Panama').id;
      },
    },
  ],
};

const CurvePointDataFixtures: DataFixture<
  Omit<Prisma.CurvePointCreateManyInput, 'id'>,
  Prisma.CurvePointDelegate
> = {
  name: 'curvePoint',
  count: 0,
  object: prismaClient.curvePoint,
  data: [...LasDeliciasCurvePoints, ...BanegasFarmCurvePoints],
};

const ProjectsSdgsDataFixtures: DataFixture<
  Omit<Prisma.ProjectsSdgsCreateManyInput, 'id'>,
  Prisma.ProjectsSdgsDelegate
> = {
  name: 'projectSdgs',
  count: 1,
  object: prismaClient.projectsSdgs,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  model: async function* ({ references }) {
    const projects: Project[] = references['project'];
    const sdgs: Sdg[] = references['sdg'];

    for (const project of projects) {
      const linkedSdgs = faker.helpers.arrayElements(sdgs);
      for (const sdg of linkedSdgs) {
        yield {
          projectId: project.id,
          sdgId: sdg.id,
        };
      }
    }
  },
  data: [],
};

const CarbonCreditsDataFixtures: DataFixture<
  Omit<Prisma.CarbonCreditCreateManyInput, 'id'>,
  Prisma.CarbonCreditDelegate
> = {
  name: 'carbonCredit',
  count: 0,
  object: prismaClient.carbonCredit,
  data: [...LasDeliciasCarbonCredits, ...BanegasFarmCarbonCredits],
};

function addId(name: string, object: any) {
  if ('projectSdgs' === name || object.hasOwnProperty('id')) {
    return object;
  }

  return {
    ...object,
    id: ulid().toString(),
  };
}

function resolveReferences(object: any, references: Array<any>) {
  for (const [key, value] of Object.entries(object)) {
    if ('function' !== typeof value) {
      continue;
    }

    object[key] = value(references);
  }

  return object;
}

async function addFixtures({ connection }) {
  const fixturesManagers = [
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

  const references = [];

  const countries = await prismaClient.country.findMany({
    select: { id: true, name: true },
  });
  references['country'] = countries;

  for (const fixture of fixturesManagers) {
    references[fixture.name] = [];

    if (0 !== fixture.data.length) {
      let txData = [];
      for (let d of fixture.data) {
        d = addId(fixture.name, d);
        d = resolveReferences(d, references);
        references[fixture.name].push(d);
        txData = [...txData, d];
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await fixture.object.createMany({ data: txData });
    }

    let fixturesData = [];
    const batchSize = 100;
    for (
      let count = fixture.data.length;
      count < fixture.count + fixture.data.length;
      count++
    ) {
      let item = await fixture.model({ connection, references });
      if (fixture.model.constructor.name === 'AsyncGeneratorFunction') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await fixture.object.createMany({ data: fixturesData });
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}

async function flush<F, T>(
  fixture: F,
  count: number,
  batchSize: number,
  data: Array<T>,
): Promise<Array<T>> {
  if (count % batchSize === 0) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await fixture.object.createMany({ data });
    return [];
  }
  return data;
}

async function seedCountries() {
  const countries = await getCountries();
  for (const country of countries) {
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
  const res = await fetch(
    'https://raw.githubusercontent.com/mledoze/countries/master/countries.json',
  );
  return await res.json();
}

(async () => {
  try {
    const connection = await prismaClient.$connect();

    await seedCountries();
    await addFixtures({ connection });

    console.log('Fixtures added successfully');
  } catch (e) {
    console.error(e);
  } finally {
    await prismaClient.$disconnect();
  }
})();
