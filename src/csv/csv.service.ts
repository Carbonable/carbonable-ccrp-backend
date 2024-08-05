import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

@Injectable()
export class CsvService {
  parseIntSafe = (value: string): number => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) throw new Error(`Invalid number: ${value}`);
    return parsed;
  };

  parseJSONSafe = (value: string): Prisma.JsonValue => {
    if (value === null) return null;
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object') {
        return parsed;
      } else {
        throw new Error(`Invalid JSON object: ${value}`);
      }
    } catch (error) {
      throw new Error(`Invalid JSON: ${value}`);
    }
  };
  async parseCsvToArrayOfStrMap<T extends { [key: string]: string }>(
    fileBuffer: Buffer,
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];
      const stream = Readable.from(fileBuffer);

      stream
        .pipe(csv({ strict: true }))
        .on('data', (data) => {
          results.push(data as T);
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(new BadRequestException(`${error}`));
        });
    });
  }
}
