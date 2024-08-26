import { Test, TestingModule } from '@nestjs/testing';
import { BusinessUnitService } from './business-unit.service';
import { CsvService } from '../../csv/csv.service';
import { PrismaService } from '../../infrastructure/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

describe('BusinessUnitService - createBusinessUnit with CSV files', () => {
  let businessUnitService: BusinessUnitService;
  let csvService: CsvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessUnitService,
        CsvService,
        {
          provide: PrismaService,
          useValue: {
            createManyOfType: jest.fn(), // Mock the PrismaService
          },
        },
      ],
    }).compile();

    businessUnitService = module.get<BusinessUnitService>(BusinessUnitService);
    csvService = module.get<CsvService>(CsvService);
  });

  it('should correctly process a well-formatted CSV file', () => {
    const csvFilePath = path.resolve(
      __dirname,
      '../../../test/csv-test/good-format/business-units.csv',
    );
    const csvBuffer = fs.readFileSync(csvFilePath);
    const csvData = csvService.parseCSV(
      csvBuffer,
      businessUnitService['createBusinessUnit'].bind(businessUnitService),
    );

    csvData.then((result) => {
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('description');
      expect(result[0]).toHaveProperty('defaultEmission');
      expect(result[0]).toHaveProperty('companyId');
    });
  });

  it('should throw an error for a badly formatted CSV file', async () => {
    const csvFilePath = path.resolve(
      __dirname,
      '../../../test/csv-test/wrong-format/business-units.csv',
    );
    const csvBuffer = fs.readFileSync(csvFilePath);

    await expect(
      csvService.parseCSV(
        csvBuffer,
        businessUnitService['createBusinessUnit'].bind(businessUnitService),
      ),
    ).rejects.toThrowError('Invalid file format');
  });
});

describe('BusinessUnitService - getBusinessUnits', () => {
  let businessUnitService: BusinessUnitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessUnitService,
        {
          provide: PrismaService,
          useValue: {
            businessUnit: {
              findMany: jest.fn(), // Mock the PrismaService
            },
          },
        },
      ],
    }).compile();

    businessUnitService = module.get<BusinessUnitService>(BusinessUnitService);
  });

  it('should retrieve all business units when database has entries', async () => {
    const mockBusinessUnits = [
      { id: 1, name: 'Unit1', company: { id: 1, name: 'Company1' } },
      { id: 2, name: 'Unit2', company: { id: 2, name: 'Company2' } }
    ];

    const prismaService = { businessUnit: { findMany: jest.fn().mockResolvedValue(mockBusinessUnits) } };

    const result = await businessUnitService.getBusinessUnits();

    expect(result).toEqual(mockBusinessUnits);
    expect(prismaService.businessUnit.findMany).toHaveBeenCalledWith({
      include: { forecastEmissions: false, forecastTargets: false, allocations: false, orders: false, company: true, Stock: false },
    });
  });
});
