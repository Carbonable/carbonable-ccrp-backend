import { Test, TestingModule } from '@nestjs/testing';
import { AllocationService } from './allocations.service';
import { CsvService } from '../../csv/csv.service';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../infrastructure/prisma.service';

describe('AllocationService - createAllocation with CSV files', () => {
  let allocationService: AllocationService;
  let csvService: CsvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllocationService,
        CsvService,
        {
          provide: PrismaService,
          useValue: {
            createManyOfType: jest.fn(), // Mock the PrismaService
          },
        },
      ],
    }).compile();

    allocationService = module.get<AllocationService>(AllocationService);
    csvService = module.get<CsvService>(CsvService);
  });

  it('should correctly process a well-formatted CSV file', () => {
    const csvFilePath = path.resolve(
      __dirname,
      '../../../test/csv-test/good-format/allocations.csv',
    );
    const csvBuffer = fs.readFileSync(csvFilePath);
    const csvData = csvService.parseCSV(
      csvBuffer,
      allocationService.createAllocation.bind(allocationService),
    );

    csvData.then((result) => {
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('quantity');
      expect(result[0]).toHaveProperty('allocatedAt');
      expect(result[0]).toHaveProperty('businessUnitId');
      expect(result[0]).toHaveProperty('projectId');
    });
  });

  it('should throw an error for a badly formatted CSV file', async () => {
    const csvFilePath = path.resolve(
      __dirname,
      '../../../test/csv-test/wrong-format/allocations.csv',
    );
    const csvBuffer = fs.readFileSync(csvFilePath);

    await expect(
      csvService.parseCSV(
        csvBuffer,
        allocationService.createAllocation.bind(allocationService),
      ),
    ).rejects.toThrowError('Invalid file format');
  });
});
