import { Injectable } from '@nestjs/common';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

@Injectable()
export class CsvService {
  async parseCsvToArrayOfStrMap<T extends { [key: string]: string }>(
    fileBuffer: Buffer,
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];
      const stream = Readable.from(fileBuffer);

      stream
        .pipe(csv())
        .on('data', (data) => results.push(data as T))
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
}
