import { CountryService, COUNTRY_MODEL } from './country.service';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvModule } from '../../csv/csv.module';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

describe('CountryService', () => {
  let service: CountryService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CsvModule],
      providers: [
        CountryService,
        {
          provide: PrismaService,
          useValue: {
            createManyOfType: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CountryService>(CountryService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('processCsv', () => {
    it('should parse the CSV and call prisma.createManyOfType', async () => {
      const buffer = Buffer.from(
        'id,name,code,data\n1,Country A,CA,{"key": "value"}\n',
      );
      const parsedData = [
        {
          id: '1',
          name: 'Country A',
          code: 'CA',
          data: { key: 'value' },
        },
      ];

      jest.spyOn(service, 'parseCSV').mockResolvedValue(parsedData);

      const result = await service.processCsv(buffer);

      expect(service.parseCSV).toHaveBeenCalledWith(buffer);
      expect(prismaService.createManyOfType).toHaveBeenCalledWith(
        COUNTRY_MODEL,
        parsedData,
      );
      expect(result).toEqual({ message: 'countrys uploaded successfully' });
    });

    it('should throw BadRequestException if CSV parsing fails', async () => {
      const buffer = Buffer.from('invalid,data');

      jest
        .spyOn(service, 'parseCSV')
        .mockRejectedValue(new BadRequestException('Invalid file format'));

      await expect(service.processCsv(buffer)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('parseCSV', () => {
    it('should parse CSV buffer and return an array of countries', async () => {
      const buffer = Buffer.from(
        'id,name,code,data\n1,Country A,CA,{"key" : "value"}\n',
      );
      const expectedOutput = [
        {
          id: '1',
          name: 'Country A',
          code: 'CA',
          data: { key: 'value' },
        },
      ];

      const result = await service.parseCSV(buffer);
      expect(result).toEqual(expectedOutput);
    });

    it('should throw BadRequestException if JSON parsing fails', async () => {
      const invalidCsvData = Buffer.from(
        'id,name,code,data\n1,Country A,CA,{"key value}\n',
      );
      await expect(service.processCsv(invalidCsvData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
