import { ulid } from 'ulid';
import { PrismaService } from '../../prisma.service';
import { PrismaOrderBookRepository } from '../order-book.prisma';
import { Order, OrderStatus } from '../../../domain/order-book';

describe('OrderBook Prisma Repository Adapter', () => {
  let prismaService: PrismaService;
  let orderBookRepository: PrismaOrderBookRepository;

  beforeEach(() => {
    prismaService = new PrismaService();
    orderBookRepository = new PrismaOrderBookRepository(prismaService);
  });

  test('should create order books', async () => {
    const orderId = ulid().toString();
    const orderData = new Order(
      orderId,
      10,
      '2024',
      '01HPETEBCZM2KZXM4FHE2GZ9QM',
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
