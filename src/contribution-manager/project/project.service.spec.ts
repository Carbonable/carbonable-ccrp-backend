import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvModule } from '../../csv/csv.module';
import { CsvService } from '../../csv/csv.service';
import { BadRequestException } from '@nestjs/common';

import {
  CarbonCreditType,
  CarbonCreditOrigin,
  ProjectColor,
} from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const mockCsvService = {
  parseIntSafe: jest.fn((value) => parseInt(value, 10)),
  parseFloatSafe: jest.fn((value) => parseFloat(value)),
  parseJSONSafe: jest.fn((value) => JSON.parse(value)),
  checkAndParseCarbonCreditType: jest.fn((value) => value as CarbonCreditType),
  checkAndParseCarbonCreditOrigin: jest.fn(
    (value) => value as CarbonCreditOrigin,
  ),
  checkAndParseProjectColor: jest.fn((value) => value as ProjectColor),
  parseCsvToArrayOfStrMap: jest.fn(),
};

describe('ProjectService', () => {
  let service: ProjectService;
  let prismaService: PrismaService;
  //   let csvService: CsvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CsvModule],
      providers: [
        ProjectService,
        {
          provide: PrismaService,
          useValue: {
            createManyOfType: jest.fn(),
          },
        },
        {
          provide: CsvService,
          useValue: mockCsvService,
        },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    prismaService = module.get<PrismaService>(PrismaService);
    // csvService = module.get<CsvService>(CsvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processCsv', () => {
    it('should process CSV data and call createManyOfType', async () => {
      const fileBuffer = Buffer.from(
        'id,name,slug,description,localization,startDate,endDate,area,type,origin,fundingAmount,color,protectedSpecies,protectedForest,riskAnalysis,metadata,certifierId,developperId,countryId,companyId\n' +
          '1,Project One,project-one,Description,Location,2022,2023,100,RESTORATION,DIRECT_PURCHASE,50000,GREEN,10,20,Risk Analysis,{"key":"value"},cert1,dev1,country1,comp1',
      );

      const projects = [
        {
          id: '1',
          name: 'Project One',
          slug: 'project-one',
          description: 'Description',
          localization: 'Location',
          startDate: '2022',
          endDate: '2023',
          area: 100,
          type: CarbonCreditType.RESTORATION,
          origin: CarbonCreditOrigin.DIRECT_PURCHASE,
          fundingAmount: 50000,
          color: ProjectColor.GREEN,
          protectedSpecies: 10,
          protectedForest: 20,
          riskAnalysis: 'Risk Analysis',
          metadata: { key: 'value' },
          certifierId: 'cert1',
          developperId: 'dev1',
          countryId: 'country1',
          companyId: 'comp1',
        },
      ];

      jest.spyOn(service, 'parseCSV').mockResolvedValueOnce(projects);

      await service.processCsv(fileBuffer);

      expect(prismaService.createManyOfType).toHaveBeenCalledWith(
        'project',
        projects,
      );
    });
  });

  describe('parseCSV', () => {
    it('should parse CSV and return projects array', async () => {
      const filePath = join(
        __dirname,
        '../../../test/csv-test/good-format/project.csv',
      );
      const fileBuffer = readFileSync(filePath);

      const result = await service.parseCSV(fileBuffer);

      expect(result).toEqual([
        {
          id: '1',
          name: 'Project A',
          certifierId: undefined,
          developperId: undefined,
          slug: 'project-a',
          description: 'Description of Project A',
          localization: 'Location A',
          startDate: '2020',
          endDate: '2025',
          area: 100,
          type: 'RESTORATION',
          origin: 'FORWARD_FINANCE',
          fundingAmount: 50000.555,
          color: 'GREEN',
          riskAnalysis: 'Low',
          protectedForest: 50,
          protectedSpecies: 10,
          metadata: {
            key1: 'value1',
          },
          companyId: '01H5739RTVV0JV8M3DAN0C10ME',
          countryId: '01J3DCPTDBETCZY5YQM041T0AZ',
        },
        {
          id: '2',
          name: 'Project B',
          slug: 'project-b',
          description: 'Description of Project B',
          localization: 'Location B',
          startDate: '2021',
          endDate: '2026',
          area: 200,
          certifierId: undefined,
          developperId: undefined,
          type: 'CONSERVATION',
          origin: 'DIRECT_PURCHASE',
          fundingAmount: 100000,
          color: 'BLUE',
          protectedForest: 100,
          protectedSpecies: 20,
          riskAnalysis: 'Med',
          metadata: {
            key2: 'value2',
          },
          companyId: '1',
          countryId: '01J3DCPTRWVKCSRK89NXVQM6F5',
        },
        {
          id: '3',
          name: 'Project C',
          slug: 'project-c',
          certifierId: undefined,
          developperId: undefined,
          description: 'Description of Project C',
          localization: 'Location C',
          startDate: '2022',
          endDate: '2027',
          area: 300,
          type: 'REFORESTATION',
          origin: 'DIRECT_PURCHASE',
          fundingAmount: 75000,
          color: 'ORANGE',
          protectedForest: 150,
          protectedSpecies: 30,
          riskAnalysis: 'High',
          metadata: {
            key3: 'value3',
          },
          companyId: '1',
          countryId: '01J3DCPTRZ09HDQ1HW76E00S64',
        },
      ]);
    });

    it('should throw error on invalid CSV format', async () => {
      const invalidCsvData = Buffer.from('invalid csv format');

      try {
        await service.parseCSV(invalidCsvData);
        fail('Expected BadRequestException to be thrown');
      } catch (error) {
        expect(error);
      }
    });
  });
});
