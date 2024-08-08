import { Test, TestingModule } from '@nestjs/testing';
import { VintageService } from './vintage.service';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';
import * as fs from 'fs';
import * as path from 'path';
import { BadRequestException } from '@nestjs/common';

describe('VintageService', () => {
  let service: VintageService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VintageService,
        {
          provide: PrismaService,
          useValue: {
            createManyOfType: jest.fn(),
          },
        },
        CsvService,
      ],
    }).compile();

    service = module.get<VintageService>(VintageService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processCsv', () => {
    it('should process a valid CSV file successfully', async () => {
      const filePath = path.join(
        __dirname,
        '../../../test/csv-test/good-format/vintage.csv',
      );
      const fileBuffer = fs.readFileSync(filePath);

      await expect(service.processCsv(fileBuffer)).resolves.toEqual({
        message: 'Vintages uploaded successfully',
      });
      expect(prismaService.createManyOfType).toHaveBeenCalled();
    });

    it('should throw BadRequestException for an invalid CSV file', async () => {
      const filePath = path.join(
        __dirname,
        '../../../test/csv-test/wrong-format/vintage.csv',
      );
      const fileBuffer = fs.readFileSync(filePath);

      await expect(service.processCsv(fileBuffer)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaService.createManyOfType).not.toHaveBeenCalled();
    });
  });
});
