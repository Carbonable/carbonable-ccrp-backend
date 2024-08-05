import { Test, TestingModule } from '@nestjs/testing';
import { CsvService } from './csv.service';
import { Buffer } from 'buffer';

describe('CsvService', () => {
  let service: CsvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CsvService],
    }).compile();

    service = module.get<CsvService>(CsvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseCsvToArrayOfStrMap', () => {
    it('should parse CSV buffer to array of objects', async () => {
      const csvData = 'name,age\nJohn,30\nJane,25';
      const buffer = Buffer.from(csvData);

      const result = await service.parseCsvToArrayOfStrMap(buffer);

      expect(result).toEqual([
        { name: 'John', age: '30' },
        { name: 'Jane', age: '25' },
      ]);
    });

    it('should reject on invalid CSV', async () => {
      const invalidCsvData = 'invalid,csv\ndata';
      const buffer = Buffer.from(invalidCsvData);

      await expect(service.parseCsvToArrayOfStrMap(buffer)).rejects.toThrow();
    });
  });
});
