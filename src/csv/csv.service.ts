import { BadRequestException, Injectable } from '@nestjs/common';
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
  parseIntSafe = (value: string): number => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) throw new Error(`Invalid number: ${value}`);
    return parsed;
  };
  parseBigIntSafe = (value: string): bigint => {
    try {
      const parsed = BigInt(value);
      return parsed;
    } catch {
      throw new Error(`Invalid BigInt: ${value}`);
    }
  };
  emptyValueError(name: string) {
    throw new Error(`Undexistent value for ${name}`);
  }
  parseBool = (value: string): boolean => {
    const val = value.toUpperCase();
    if (val == 'X' || val == 'TRUE') {
      return true;
    } else if (val == 'FALSE' || !val) return false;
    throw new Error(`Invalid boolean: ${value}`);
  };

  checkAndParseCarbonCreditType(value: string): CarbonCreditType {
    if (!Object.values(CarbonCreditType).includes(value as CarbonCreditType)) {
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
      throw Error(`${value} is not a CarbonCreditAuditStatus`);
    }
    return value as CarbonCreditAuditStatus;
  }
  checkAndParseCarbonCreditOrigin(value: string): CarbonCreditOrigin {
    if (
      !Object.values(CarbonCreditOrigin).includes(value as CarbonCreditOrigin)
    ) {
      throw Error(`${value} is not a CarbonCreditOrigin`);
    }
    return value as CarbonCreditOrigin;
  }
  checkAndParseProjectColor(value: string): ProjectColor {
    if (!Object.values(ProjectColor).includes(value as ProjectColor)) {
      throw Error(`${value} is not a ProjectColor`);
    }
    return value as ProjectColor;
  }
  parseFloatSafe = (value: string): number => {
    if (!value.includes('.')) value += '.0';
    const parsed = parseFloat(value);
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
