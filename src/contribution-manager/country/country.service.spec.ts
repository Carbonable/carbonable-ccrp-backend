import { Test, TestingModule } from '@nestjs/testing';
import { CountryService } from './country.service';
import { CsvService } from '../../csv/csv.service';
import { PrismaService } from '../../infrastructure/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

describe('CountryService - createCountry with CSV files', () => {
  let countryService: CountryService;
  let csvService: CsvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryService,
        CsvService,
        {
          provide: PrismaService,
          useValue: {
            createManyOfType: jest.fn(), // Mock the PrismaService
          },
        },
      ],
    }).compile();

    countryService = module.get<CountryService>(CountryService);
    csvService = module.get<CsvService>(CsvService);
  });

  it('should correctly process a well-formatted CSV file', () => {
    const csvFilePath = path.resolve(
      __dirname,
      '../../../test/csv-test/good-format/countries.csv',
    );
    const csvBuffer = fs.readFileSync(csvFilePath);
    const csvData = csvService.parseCSV(
      csvBuffer,
      countryService['createCountry'].bind(countryService),
    );

    csvData.then((result) => {
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('code');
      expect(result[0]).toHaveProperty('data');
    });
  });

  it('should throw an error for a badly formatted CSV file', async () => {
    const csvFilePath = path.resolve(
      __dirname,
      '../../../test/csv-test/wrong-format/countries.csv',
    );
    const csvBuffer = fs.readFileSync(csvFilePath);

    await expect(
      csvService.parseCSV(
        csvBuffer,
        countryService['createCountry'].bind(countryService),
      ),
    ).rejects.toThrowError('Invalid file format');
  });
});
