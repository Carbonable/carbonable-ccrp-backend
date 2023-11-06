import { faker } from '@faker-js/faker';
import {
  CarbonCreditOrigin,
  CarbonCreditType,
  Prisma,
  PrismaClient,
  Project,
  ProjectColor,
  Sdg,
} from '@prisma/client';
import slugify from 'slugify';
import { LasDeliciasCurvePoints } from './las-delicias';
import { BanegasFarmCurvePoints } from './banegas-farm';
import { PrismaService } from '../../infrastructure/prisma.service';
import { Vintage } from '../../domain/portfolio';
import { UlidIdGenerator } from '../../domain/common';

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

type DataFixtureFn = { prismaClient: PrismaService };

export const CertifierDataFixtures = ({
  prismaClient,
}: DataFixtureFn): DataFixture<
  Omit<Prisma.CertifierCreateManyInput, 'id'>,
  Prisma.CertifierDelegate
> => ({
  name: 'certifier',
  count: 10,
  object: prismaClient.certifier,
  model: async ({}) => {
    const name = faker.company.name();
    return { name, slug: slugify(name.toLowerCase()) };
  },
  data: [{ name: 'Wildsense', slug: 'Wildsense' }],
});

export const CompanyDataFixtures = ({
  prismaClient,
}: DataFixtureFn): DataFixture<
  Prisma.CompanyCreateManyInput,
  Prisma.CompanyDelegate
> => ({
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
});

export const DevelopperDataFixtures = ({
  prismaClient,
}: DataFixtureFn): DataFixture<
  Prisma.DevelopperCreateManyInput,
  Prisma.DevelopperDelegate
> => ({
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
});

export const SdgDataFixtures = ({
  prismaClient,
}: DataFixtureFn): DataFixture<
  Omit<Prisma.SdgCreateManyInput, 'id'>,
  Prisma.SdgDelegate
> => ({
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
});

export const ProjectDataFixtures = ({
  prismaClient,
}: DataFixtureFn): DataFixture<
  Prisma.ProjectCreateManyInput,
  Prisma.ProjectDelegate
> => ({
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
      metadata: {},
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
      metadata: {},
    },
  ],
});

export const ProjectsSdgsDataFixtures = ({
  prismaClient,
}: DataFixtureFn): DataFixture<
  Omit<Prisma.ProjectsSdgsCreateManyInput, 'id'>,
  Prisma.ProjectsSdgsDelegate
> => ({
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
});

export const VintageDataFixtures = ({
  prismaClient,
}: DataFixtureFn): DataFixture<
  Omit<Prisma.VintageCreateManyInput, 'id'>,
  Prisma.VintageDelegate
> => ({
  name: 'vintage',
  count: 1,
  object: prismaClient.vintage,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  model: async function* ({ references }) {
    const projects: Project[] = references['project'];

    for (const project of projects) {
      let data = [];
      if ('Las Delicias' === project.name) {
        data = LasDeliciasCurvePoints;
      } else {
        data = BanegasFarmCurvePoints;
      }
      const vintage = await Vintage.buildFromAbsorptionCurve(
        new UlidIdGenerator(),
        data,
      );
      for (const item of vintage) {
        yield {
          id: item.id,
          year: item.year,
          capacity: item.capacity,
          projectId: project.id,
        };
      }
    }
  },
  data: [],
});
