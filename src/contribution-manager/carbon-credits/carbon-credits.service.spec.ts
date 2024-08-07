import { Test, TestingModule } from '@nestjs/testing';
import { CarbonCreditService } from './carbon-credits.service';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

import * as path from 'path';

describe('CarbonCreditService', () => {
  let service: CarbonCreditService;
  let csvService: CsvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarbonCreditService,
        {
          provide: PrismaService,
          useValue: {
            createManyOfType: jest.fn(),
          },
        },
        {
          provide: CsvService,
          useValue: {
            emptyValueError: jest.fn((name: string) => {
              throw new Error(`Non-existent value for ${name}`);
            }),
            checkAndParseCarbonCreditType: jest.fn((type) => type),
            checkAndParseCarbonCreditOrigin: jest.fn((origin) => origin),
            parseBool: jest.fn((value: string) => value === 'true'),
            checkAndParseAuditStatus: jest.fn((status) => status),
          },
        },
      ],
    }).compile();

    service = module.get<CarbonCreditService>(CarbonCreditService);
    csvService = module.get<CsvService>(CsvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processCsv', () => {
    it('should process CSV and upload data successfully', async () => {
      const fileBuffer = fs.readFileSync(
        path.resolve(
          __dirname,
          '../../../test/csv-test/good-format/carbon-credits.csv',
        ),
      );

      const result = await service.processCsv(fileBuffer);
      expect(result).toEqual({
        message: 'CarbonCredits uploaded successfully',
      });
    });

    it('should throw BadRequestException for invalid CSV', async () => {
      const fileBuffer = Buffer.from('invalid,csv,content');
      jest
        .spyOn(service, 'parseCSV')
        .mockRejectedValue(
          new BadRequestException('Invalid file format: Error'),
        );

      await expect(service.processCsv(fileBuffer)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('parseCSV', () => {
    it('should parse CSV and return data', async () => {
      const fileBuffer = Buffer.from(
        'id,number,vintage,type,origin,purchasePrice,isRetired,isLocked,isPurchased,auditStatus,projectId,allocationId\n1,CC1234,2023,RESTORATION,FORWARD_FINANCE,500000,false,false,false,PROJECTED,proj_001,alloc_001',
      );
      const data = [
        {
          id: '1',
          number: 'CC1234',
          vintage: '2023',
          type: 'RESTORATION',
          origin: 'FORWARD_FINANCE',
          purchasePrice: BigInt(500000),
          isRetired: false,
          isLocked: false,
          isPurchased: false,
          auditStatus: 'PROJECTED',
          projectId: 'proj_001',
          allocationId: 'alloc_001',
        },
      ];

      jest
        .spyOn(csvService, 'checkAndParseCarbonCreditType')
        .mockReturnValue('RESTORATION');
      jest
        .spyOn(csvService, 'checkAndParseCarbonCreditOrigin')
        .mockReturnValue('FORWARD_FINANCE');
      jest
        .spyOn(csvService, 'parseBool')
        .mockImplementation((value: string) => value === 'true');
      jest
        .spyOn(csvService, 'checkAndParseAuditStatus')
        .mockReturnValue('PROJECTED');

      const result = await service.parseCSV(fileBuffer);
      expect(result).toEqual(data);
    });

    it('should throw BadRequestException for invalid CSV row', async () => {
      const fileBuffer = Buffer.from(
        'id,number,vintage,type,origin,purchasePrice,isRetired,isLocked,isPurchased,auditStatus,projectId,allocationId\n1,CC1234,2023,RESTORATION,FORWARD_FINANCE,invalid,false,false,false,PROJECTED,proj_001,alloc_001',
      );

      jest
        .spyOn(csvService, 'checkAndParseCarbonCreditType')
        .mockReturnValue('RESTORATION');
      jest
        .spyOn(csvService, 'checkAndParseCarbonCreditOrigin')
        .mockReturnValue('FORWARD_FINANCE');
      jest
        .spyOn(csvService, 'parseBool')
        .mockImplementation((value: string) => value === 'true');
      jest
        .spyOn(csvService, 'checkAndParseAuditStatus')
        .mockReturnValue('PROJECTED');

      await expect(service.parseCSV(fileBuffer)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
