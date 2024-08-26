import { Test, TestingModule } from '@nestjs/testing';
import { CompanyService } from './company.service';
import { CsvService } from '../../csv/csv.service';
import { PrismaService } from '../../infrastructure/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

describe('CompanyService - createCompany with CSV files', () => {
  let companyService: CompanyService;
  let csvService: CsvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        CsvService,
        {
          provide: PrismaService,
          useValue: {
            createManyOfType: jest.fn(), // Mock the PrismaService
          },
        },
      ],
    }).compile();

    companyService = module.get<CompanyService>(CompanyService);
    csvService = module.get<CsvService>(CsvService);
  });

  it('should correctly process a well-formatted CSV file', () => {
    const csvFilePath = path.resolve(
      __dirname,
      '../../../test/csv-test/good-format/companies.csv',
    );
    const csvBuffer = fs.readFileSync(csvFilePath);
    const csvData = csvService.parseCSV(
      csvBuffer,
      companyService['createCompany'].bind(companyService),
    );

    csvData.then((result) => {
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('slug');
    });
  });

  it('should throw an error for a badly formatted CSV file', async () => {
    const csvFilePath = path.resolve(
      __dirname,
      '../../../test/csv-test/wrong-format/companies.csv',
    );
    const csvBuffer = fs.readFileSync(csvFilePath);

    await expect(
      csvService.parseCSV(
        csvBuffer,
        companyService['createCompany'].bind(companyService),
      ),
    ).rejects.toThrowError('Invalid file format');
  });

  it('should return a list of companies when there are companies in the database', async () => {
    const mockCompanies = [
      { id: 1, name: 'Company A' },
      { id: 2, name: 'Company B' },
    ];
    const prismaService = {
      company: { findMany: jest.fn().mockResolvedValue(mockCompanies) },
    };

    const result = await companyService.getCompanies();

    expect(result).toEqual(mockCompanies);
    expect(prismaService.company.findMany).toHaveBeenCalledWith({
      include: { configuration: false, projects: false },
    });
  });
});

