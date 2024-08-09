import { Test, TestingModule } from '@nestjs/testing';
import { CarbonCreditService } from './carbon-credits.service';
import { CsvService } from '../../csv/csv.service';
import { PrismaService } from '../../infrastructure/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

describe('CarbonCreditService - createCarbonCredit with CSV files', () => {
  let carbonCreditService: CarbonCreditService;
  let csvService: CsvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarbonCreditService,
        CsvService,
        {
          provide: PrismaService,
          useValue: {
            createManyOfType: jest.fn(), // Mock the PrismaService
          },
        },
      ],
    }).compile();

    carbonCreditService = module.get<CarbonCreditService>(CarbonCreditService);
    csvService = module.get<CsvService>(CsvService);
  });

  it('should correctly process a well-formatted CSV file', () => {
    const csvFilePath = path.resolve(
      __dirname,
      '../../../test/csv-test/good-format/carbon-credits.csv',
    );
    const csvBuffer = fs.readFileSync(csvFilePath);
    const csvData = csvService.parseCSV(
      csvBuffer,
      carbonCreditService['createCarbonCredit'].bind(carbonCreditService),
    );

    csvData.then((result) => {
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('number');
      expect(result[0]).toHaveProperty('vintage');
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('projectId');
    });
  });

  it('should throw an error for a badly formatted CSV file', async () => {
    const csvFilePath = path.resolve(
      __dirname,
      '../../../test/csv-test/wrong-format/carbon-credits.csv',
    );
    const csvBuffer = fs.readFileSync(csvFilePath);

    await expect(
      csvService.parseCSV(
        csvBuffer,
        carbonCreditService['createCarbonCredit'].bind(carbonCreditService),
      ),
    ).rejects.toThrowError('Invalid file format');
  });
});
