import { Test, TestingModule } from '@nestjs/testing';
import { VintageService } from './vintage.service';
import { CsvService } from '../../csv/csv.service';
import { PrismaService } from '../../infrastructure/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

describe('VintageService - createVintage with CSV files', () => {
  let vintageService: VintageService;
  let csvService: CsvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VintageService,
        CsvService,
        {
          provide: PrismaService,
          useValue: {
            createManyOfType: jest.fn(), // Mock the PrismaService
          },
        },
      ],
    }).compile();

    vintageService = module.get<VintageService>(VintageService);
    csvService = module.get<CsvService>(CsvService);
  });

  it('should correctly process a well-formatted CSV file', () => {
    const csvFilePath = path.resolve(
      __dirname,
      '../../../test/csv-test/good-format/vintages.csv',
    );
    const csvBuffer = fs.readFileSync(csvFilePath);
    const csvData = csvService.parseCSV(
      csvBuffer,
      vintageService['createVintage'].bind(vintageService),
    );

    csvData.then((result) => {
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('year');
      expect(result[0]).toHaveProperty('capacity');
      expect(result[0]).toHaveProperty('projectId');
    });
  });

  it('should throw an error for a badly formatted CSV file', async () => {
    const csvFilePath = path.resolve(
      __dirname,
      '../../../test/csv-test/wrong-format/vintages.csv',
    );
    const csvBuffer = fs.readFileSync(csvFilePath);

    await expect(
      csvService.parseCSV(
        csvBuffer,
        vintageService['createVintage'].bind(vintageService),
      ),
    ).rejects.toThrowError('Invalid file format');
  });
});
