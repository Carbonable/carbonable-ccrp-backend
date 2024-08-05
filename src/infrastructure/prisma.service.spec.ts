import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call createManyOfType', async () => {
    const data = [{ name: 'Unit 1' }, { name: 'Unit 2' }];
    jest.spyOn(service, 'createManyOfType').mockResolvedValue(undefined);

    await service.createManyOfType('businessUnit', data);

    expect(service.createManyOfType).toHaveBeenCalledWith('businessUnit', data);
  });
});
