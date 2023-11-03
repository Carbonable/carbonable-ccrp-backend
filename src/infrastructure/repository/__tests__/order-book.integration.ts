import { ulid } from 'ulid';
import { PrismaService } from '../../prisma.service';
import { PrismaOrderBookRepository } from '../order-book.prisma';
import { Order, OrderStatus } from '../../../domain/order-book';
import { BusinessUnit, Company } from '../../../domain/business-unit';
import { PrismaCompanyRepository } from '../company.prisma';

describe('OrderBook Prisma Repository Adapter', () => {
  let prismaService: PrismaService;
  let orderBookRepository: PrismaOrderBookRepository;
  let companyRepository: PrismaCompanyRepository;

  beforeEach(() => {
    prismaService = new PrismaService();
    orderBookRepository = new PrismaOrderBookRepository(prismaService);
    companyRepository = new PrismaCompanyRepository(prismaService);
  });

  test('should create order books', async () => {
    const companyId = ulid().toString();
    const businessUnitId = ulid().toString();
    const businessUnit = new BusinessUnit(
      businessUnitId,
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
    const companyData = new Company(companyId, 'Test Carbonable 3', [
      businessUnit,
    ]);

    await companyRepository.save(companyData);

    const orderId = ulid().toString();
    const orderData = new Order(
      orderId,
      10,
      '2024',
      businessUnitId,
      OrderStatus.OPEN,
      [],
      [],
    );

    await orderBookRepository.save([orderData]);
  });

  test('should list orders for business units', async () => {
    // expect(await orderBookRepository.byId(companyId)).toEqual(companyData);
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });
});
