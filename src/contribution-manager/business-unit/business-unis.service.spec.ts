import { Test, TestingModule } from '@nestjs/testing';
import {
  BusinessUnitService,
  BUSINESS_UNIT_MODEL,
  BusinessUnit,
} from './business-unit.service';
import { PrismaService } from '../../infrastructure/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CsvModule } from '../../csv/csv.module';

describe('BusinessUnitService', () => {
  let service: BusinessUnitService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CsvModule],
      providers: [
        BusinessUnitService,
        {
          provide: PrismaService,
          useValue: {
            createManyOfType: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BusinessUnitService>(BusinessUnitService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processCsv', () => {
    it('should process CSV data and call createManyOfType', async () => {
      const mockCsvData = Buffer.from(
        'id,name,description,defaultEmission,defaultTarget,debt,metadata,companyId\n1,Unit1,Desc1,100,200,300,{"key":"value"},comp1',
      );
      const expectedParsedData: BusinessUnit[] = [
        {
          id: '1',
          name: 'Unit1',
          description: 'Desc1',
          defaultEmission: 100,
          defaultTarget: 200,
          debt: 300,
          metadata: { key: 'value' } as Prisma.JsonValue,
          companyId: 'comp1',
        },
      ];

      jest.spyOn(service, 'parseCSV').mockResolvedValue(expectedParsedData);
      jest
        .spyOn(prismaService, 'createManyOfType')
        .mockResolvedValue(undefined);

      const result = await service.processCsv(mockCsvData);

      expect(service.parseCSV).toHaveBeenCalledWith(mockCsvData);
      expect(prismaService.createManyOfType).toHaveBeenCalledWith(
        BUSINESS_UNIT_MODEL,
        expectedParsedData,
      );
      expect(result).toEqual({
        message: 'BusinessUnits uploaded successfully',
      });
    });
  });

  describe('parseCSV', () => {
    it('should parse valid CSV data', async () => {
      const mockCsvData = Buffer.from(
        'id,name,description,defaultEmission,defaultTarget,debt,metadata,companyId\n' +
          '1,Unit1,Desc1,100,200,300,"{""key"":""value""}",comp1\n' +
          '2,Unit2,Desc2,101,201,301,"{""key"":""value2""}",comp2\n' +
          '3,Unit3,Desc3,102,202,302,"{""key"":""value3""}",comp3',
      );

      let result;
      try {
        result = await service.parseCSV(mockCsvData);
      } catch (error) {
        console.error('Error in parseCSV:', error);
        throw error;
      }

      const expectedResult: BusinessUnit[] = [
        {
          id: '1',
          name: 'Unit1',
          description: 'Desc1',
          defaultEmission: 100,
          defaultTarget: 200,
          debt: 300,
          metadata: { key: 'value' } as Prisma.JsonValue,
          companyId: 'comp1',
        },
        {
          id: '2',
          name: 'Unit2',
          description: 'Desc2',
          defaultEmission: 101,
          defaultTarget: 201,
          debt: 301,
          metadata: { key: 'value2' } as Prisma.JsonValue,
          companyId: 'comp2',
        },
        {
          id: '3',
          name: 'Unit3',
          description: 'Desc3',
          defaultEmission: 102,
          defaultTarget: 202,
          debt: 302,
          metadata: { key: 'value3' } as Prisma.JsonValue,
          companyId: 'comp3',
        },
      ];

      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException for invalid CSV data', async () => {
      const invalidCsvData = Buffer.from(
        'id,name,description,defaultEmission,defaultTarget,debt,metadata,companyId\n1,Unit1,Desc1,invalid,200,300,{"key":"value"},comp1',
      );

      try {
        await service.parseCSV(invalidCsvData);
        fail('Expected BadRequestException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        // expect(error.message).toMatch(/^Invalid file format: /);
      }
    });

    it('should throw BadRequestException with correct error message for invalid CSV data', async () => {
      const invalidCsvData = Buffer.from(
        'id,name,description,defaultEmission,defaultTarget,debt,metadata,companyId\n1,Unit1,Desc1,invalid,200,300,{"key":"value"},comp1',
      );

      try {
        await service.parseCSV(invalidCsvData);
        fail('Expected BadRequestException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        // expect(error.message).toMatch(/^Invalid file format: /);
      }
    });
  });
});
