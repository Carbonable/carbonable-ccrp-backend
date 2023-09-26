import { ulid } from 'ulid';
import { PrismaService } from '../../prisma.service';
import { PrismaCompanyRepository } from '../company.prisma';
import { BusinessUnit, Company } from '../../../domain/business-unit';

describe('Company Prisma Repository Adapter', () => {
  let prismaService: PrismaService;
  let companyRepository: PrismaCompanyRepository;

  beforeEach(() => {
    prismaService = new PrismaService();
    companyRepository = new PrismaCompanyRepository(prismaService);
  });

  test('should create a company', async () => {
    const companyId = ulid().toString();
    const companyData = new Company(companyId, 'Test Carbonable 1');

    await companyRepository.save(companyData);

    expect(await companyRepository.byId(companyId)).toEqual(companyData);
  });

  test('should create a company with business units', async () => {
    const companyId = ulid().toString();
    const businessUnitId1 = ulid().toString();
    const businessUnit1 = new BusinessUnit(
      businessUnitId1,
      'Usine',
      "Coeur de l'activité",
      100,
      50,
      0,
      companyId,
      [
        { key: 'type', value: 'factory' },
        { key: 'location', value: 'Paris' },
        { key: 'color', value: 'red' },
      ],
    );
    const businessUnitId2 = ulid().toString();
    const businessUnit2 = new BusinessUnit(
      businessUnitId2,
      'Bureaux',
      'Centre décisionnel',
      50,
      100,
      0,
      companyId,
      [
        { key: 'type', value: 'office' },
        { key: 'location', value: 'Paris' },
        { key: 'color', value: 'blue' },
      ],
    );
    const companyData = new Company(companyId, 'Test Carbonable 2', [
      businessUnit1,
      businessUnit2,
    ]);

    await companyRepository.save(companyData);

    const c = await companyRepository.byId(companyId);
    expect(c).toEqual(companyData);
    expect(c.businessUnits.length).toEqual(2);
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });
});
