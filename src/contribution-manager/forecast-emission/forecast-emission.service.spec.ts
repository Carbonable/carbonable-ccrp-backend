import { Test, TestingModule } from '@nestjs/testing';
import { ForecastEmissionService } from './forecast-emission.service';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';
import * as fs from 'fs';
import * as path from 'path';
import { BadRequestException } from '@nestjs/common';

describe('ForecastEmissionService', () => {
  let service: ForecastEmissionService;
  let prismaService: PrismaService;
  //   let csvService: CsvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForecastEmissionService,
        {
          provide: PrismaService,
          useValue: {
            createManyOfType: jest.fn(),
          },
        },
        CsvService,
      ],
    }).compile();

    service = module.get<ForecastEmissionService>(ForecastEmissionService);
    prismaService = module.get<PrismaService>(PrismaService);
    // csvService = module.get<CsvService>(CsvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processCsv', () => {
    it('should process a valid CSV file successfully', async () => {
      const filePath = path.join(
        __dirname,
        '../../../test/csv-test/good-format/forecast-emission.csv',
      );
      const fileBuffer = fs.readFileSync(filePath);

      await expect(service.processCsv(fileBuffer)).resolves.toEqual({
        message: 'ForecastEmissions uploaded successfully',
      });
      expect(prismaService.createManyOfType).toHaveBeenCalled();
    });

    it('should throw BadRequestException for an invalid CSV file', async () => {
      const filePath = path.join(
        __dirname,
        '../../../test/csv-test/wrong-format/forecast-emission.csv',
      );
      const fileBuffer = fs.readFileSync(filePath);

      await expect(service.processCsv(fileBuffer)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaService.createManyOfType).not.toHaveBeenCalled();
    });
  });
});
