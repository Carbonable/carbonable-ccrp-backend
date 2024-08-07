import { Test, TestingModule } from '@nestjs/testing';
import { AllocationService } from './allocations.service';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';
import * as fs from 'fs';
import * as path from 'path';
import { BadRequestException } from '@nestjs/common';

describe('AllocationService', () => {
  let service: AllocationService;
  let prismaService: PrismaService;
  let csvService: CsvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllocationService,
        {
          provide: PrismaService,
          useValue: {
            createManyOfType: jest.fn(),
          },
        },
        CsvService,
      ],
    }).compile();

    service = module.get<AllocationService>(AllocationService);
    prismaService = module.get<PrismaService>(PrismaService);
    csvService = module.get<CsvService>(CsvService);
  });

  it('should process a good CSV file successfully', async () => {
    const filePath = path.join(
      __dirname,
      '../../../test/csv-test/good-format/allocations.csv',
    );
    const fileBuffer = fs.readFileSync(filePath);

    const result = await service.processCsv(fileBuffer);

    expect(result).toEqual({ message: 'Allocations uploaded successfully' });
    expect(prismaService.createManyOfType).toHaveBeenCalledTimes(1);
    expect(prismaService.createManyOfType).toHaveBeenCalledWith(
      'allocation',
      expect.any(Array),
    );
  });

  it('should throw an error for a bad CSV file', async () => {
    const filePath = path.join(
      __dirname,
      '../../../test/csv-test/wrong-format/allocations.csv',
    );
    const fileBuffer = fs.readFileSync(filePath);

    await expect(service.processCsv(fileBuffer)).rejects.toThrow(
      BadRequestException,
    );
    expect(prismaService.createManyOfType).not.toHaveBeenCalled();
  });
});
