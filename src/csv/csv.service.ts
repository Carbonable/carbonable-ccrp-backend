import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import {
  CarbonCreditType,
  CarbonCreditOrigin,
  ProjectColor,
  CarbonCreditAuditStatus,
} from '@prisma/client';

@Injectable()
export class CsvService {
  private readonly logger = new Logger(CsvService.name);

  public parseCSV<T>(
    buffer: Buffer,
    createEntityFctn: (data: any) => T,
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];
      const stream = Readable.from(buffer);
      this.logger.log('Start parse');

      stream
        .pipe(csv({ strict: true }))
        .on('data', (data) => {
          this.logger.log(`Start stream parse : ${data?.name}`);
          this.handleCsvData(data, results, createEntityFctn, reject);
        })
        .on('end', () => resolve(results))
        .on('error', (error) => {
          this.logger.error(`Error while parsing csv :  ${error}`);
          reject(new BadRequestException(`Invalid file format: ${error}`));
        });
    });
  }

  private handleCsvData<T>(
    data: any,
    results: T[],
    createEntityFctn: (data: any) => T,
    reject: (reason?: any) => void,
  ): void {
    try {
      const entity = createEntityFctn(data);
      results.push(entity);
    } catch (error: any) {
      const err = 'Invalid file format: ' + JSON.stringify(error);
      this.logger.error(err);
      reject(new BadRequestException(err));
    }
  }

  parseIntSafe = (value: string): number => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      this.logger.error(`Invalid number: ${value}`);
      throw new Error(`Invalid number: ${value}`);
    }
    return parsed;
  };

  parseUintSafe = (value: string): number => {
    const num = this.parseIntSafe(value);
    if (num < 0) {
      this.logger.error(`Negative number: ${value}`);
      throw new Error(`Negative number: ${value}`);
    }
    return num;
  };

  parseNonNullUint = (value: string): number => {
    const num = this.parseUintSafe(value);
    if (!num) {
      this.logger.error(`Value cannot be 0: ${value}`);
      throw new Error(`Value cannot be 0`);
    }
    return num;
  };

  nonNullString(data: any, str: string): string {
    if (!data[str]) {
      this.logger.error(`Undexistent value for ${str}`);
      this.emptyValueError(str);
    }
    return data[str];
  }

  parseDateSafe = (value: string): Date => {
    const parsed = new Date(value);
    if (parsed.toString().includes('Invalid')) {
      this.logger.error(`Invalid date: ${value}`);
      throw new Error(`${parsed} : ${value}`);
    }
    return parsed;
  };

  parseBigIntSafe = (value: string): bigint => {
    try {
      const parsed = BigInt(value);
      return parsed;
    } catch {
      this.logger.error(`Invalid BigInt: ${value}`);
      throw new Error(`Invalid BigInt: ${value}`);
    }
  };

  emptyValueError(name: string) {
    this.logger.error(`Undexistent value for ${name}`);
    throw new Error(`Undexistent value for ${name}`);
  }

  parseBool = (value: string): boolean => {
    const val = value.toUpperCase();
    if (val == 'X' || val == 'TRUE') {
      return true;
    } else if (val == 'FALSE' || !val) {
      return false;
    }
    this.logger.error(`Invalid boolean: ${value}`);
    throw new Error(`Invalid boolean: ${value}`);
  };

  checkAndParseCarbonCreditType(value: string): CarbonCreditType {
    if (!Object.values(CarbonCreditType).includes(value as CarbonCreditType)) {
      this.logger.error(`${value} is not a CarbonCreditType`);
      throw Error(`${value} is not a CarbonCreditType`);
    }
    return value as CarbonCreditType;
  }

  checkAndParseAuditStatus(value: string): CarbonCreditAuditStatus {
    if (
      !Object.values(CarbonCreditAuditStatus).includes(
        value as CarbonCreditAuditStatus,
      )
    ) {
      this.logger.error(`${value} is not a CarbonCreditAuditStatus`);
      throw Error(`${value} is not a CarbonCreditAuditStatus`);
    }
    return value as CarbonCreditAuditStatus;
  }

  checkAndParseCarbonCreditOrigin(value: string): CarbonCreditOrigin {
    if (
      !Object.values(CarbonCreditOrigin).includes(value as CarbonCreditOrigin)
    ) {
      this.logger.error(`${value} is not a CarbonCreditOrigin`);
      throw Error(`${value} is not a CarbonCreditOrigin`);
    }
    return value as CarbonCreditOrigin;
  }

  checkAndParseProjectColor(value: string): ProjectColor {
    if (!Object.values(ProjectColor).includes(value as ProjectColor)) {
      this.logger.error(`${value} is not a ProjectColor`);
      throw Error(`${value} is not a ProjectColor`);
    }
    return value as ProjectColor;
  }

  parseFloatSafe = (value: string): number => {
    if (!value.includes('.')) value += '.0';
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      this.logger.error(`Invalid floating number: ${value}`);
      throw new Error(`Invalid floating number: ${value}`);
    }
    return parsed;
  };

  parseJSONSafe = (value: string): Prisma.JsonValue => {
    if (value === null) return null;
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object') {
        return parsed;
      } else {
        this.logger.error(`Invalid JSON object: ${value}`);
        throw new Error(`Invalid JSON object: ${value}`);
      }
    } catch (error) {
      this.logger.error(`Invalid JSON: ${value}`);
      throw new Error(`Invalid JSON: ${value}`);
    }
  };
}
