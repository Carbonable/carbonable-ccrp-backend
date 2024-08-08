import { Test, TestingModule } from '@nestjs/testing';
import { ForecastService } from './forecast.service';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';
import * as fs from 'fs';
import * as path from 'path';
import { BadRequestException } from '@nestjs/common';
import { ForecastType } from './types';

describe('ForecastService', () => {
  let service: ForecastService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForecastService,
        {
          provide: PrismaService,
          useValue: {
            createManyOfType: jest.fn(),
          },
        },
        CsvService,
      ],
    }).compile();

    service = module.get<ForecastService>(ForecastService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processCsv', () => {
    it('should process a valid CSV  EMISSION file successfully', async () => {
      const filePath = path.join(
        __dirname,
        '../../../test/csv-test/good-format/forecast-emission.csv',
      );
      const fileBuffer = fs.readFileSync(filePath);

      await expect(
        service.processCsv(fileBuffer, ForecastType.EMISSION),
      ).resolves.toEqual({
        message: 'Forecasts uploaded successfully',
      });
      expect(prismaService.createManyOfType).toHaveBeenCalled();
    });
    it('should process a valid CSV  TARGET file successfully', async () => {
      const filePath = path.join(
        __dirname,
        '../../../test/csv-test/good-format/forecast-emission.csv',
      );
      const fileBuffer = fs.readFileSync(filePath);

      await expect(
        service.processCsv(fileBuffer, ForecastType.EMISSION),
      ).resolves.toEqual({
        message: 'Forecasts uploaded successfully',
      });
      expect(prismaService.createManyOfType).toHaveBeenCalled();
    });
    it('should throw BadRequestException for an invalid CSV file', async () => {
      const filePath = path.join(
        __dirname,
        '../../../test/csv-test/wrong-format/forecast-emission.csv',
      );
      const fileBuffer = fs.readFileSync(filePath);

      await expect(
        service.processCsv(fileBuffer, ForecastType.TARGET),
      ).rejects.toThrow(BadRequestException);
      expect(prismaService.createManyOfType).not.toHaveBeenCalled();
    });
  });
});
