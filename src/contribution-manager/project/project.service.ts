import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';

export type Project = Prisma.ProjectGetPayload<{
  include: {
    carbonCredits: false;
    certifier: false;
    certifierId: false;
    developper: false;
    developperId: false;
    country: false;
    company: false;
    projectsSdgs: false;
    stock: false;
    vintages: false;
    allocations: false;
  };
}>;

export const PROJECT_MODEL = 'project';
@Injectable()
export class ProjectService {
  logger = new Logger(ProjectService.name);
  constructor(private prisma: PrismaService, private csv: CsvService) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    const data = await this.parseCSV(fileBuffer);

    await this.prisma.createManyOfType(PROJECT_MODEL, data);

    return { message: `Projects uploaded successfully` };
  }

  parseCSV(buffer: Buffer): Promise<Project[]> {
    return new Promise((resolve, reject) => {
      const results: Project[] = [];
      const stream = Readable.from(buffer);
      stream
        .pipe(csv({ strict: true }))
        .on('data', (data) => {
          try {
            const {
              id,
              name,
              slug,
              description,
              localization,
              startDate,
              endDate,
              area,
              type,
              origin,
              fundingAmount,
              color,
              protectedSpecies,
              protectedForest,
              riskAnalysis,
              metadata,
              certifierId,
              developperId,
              countryId,
              companyId,
            } = data;

            if (
              !id ||
              !name ||
              !slug ||
              !type ||
              !origin ||
              !startDate ||
              !endDate ||
              !countryId ||
              !companyId
            ) {
              throw new Error(
                `Missing required fields: ${!id ? 'id, ' : ''}${
                  !name ? 'name, ' : ''
                }${!type ? 'type, ' : ''}${!origin ? 'origin, ' : ''}${
                  !startDate ? 'startDate, ' : ''
                }${!endDate ? 'endDate, ' : ''}${
                  !certifierId ? 'certifierId, ' : ''
                }${!description ? 'description, ' : ''}${
                  !localization ? 'localization, ' : ''
                }${!endDate ? 'endDate, ' : ''}
                ${!developperId ? 'developperId, ' : ''}${
                  !countryId ? 'countryId, ' : ''
                }${!companyId ? 'companyId, ' : ''}`.slice(0, -2),
              );
            }

            const project: Project = {
              id: id,
              name: name,
              slug: slug,
              description: description,
              localization: localization,
              startDate: startDate,
              endDate: endDate,
              area: this.csv.parseIntSafe(area),
              type: this.csv.checkAndParseCarbonCreditType(type),
              origin: this.csv.checkAndParseCarbonCreditOrigin(origin),
              fundingAmount: this.csv.parseFloatSafe(fundingAmount),
              color: this.csv.checkAndParseProjectColor(color),
              protectedSpecies: this.csv.parseIntSafe(protectedSpecies),
              protectedForest: this.csv.parseIntSafe(protectedForest),
              riskAnalysis: riskAnalysis,
              metadata: this.csv.parseJSONSafe(metadata),
              certifierId: certifierId,
              developperId: developperId,
              countryId: countryId,
              companyId: companyId,
            };
            results.push(project);
          } catch (error: any) {
            console.error(error);
            reject(new BadRequestException('Invalid file format: ' + error));
          }
        })

        .on('error', (error) => {
          console.error(error);
          reject(new BadRequestException('Invalid file format:' + error));
        })
        .on('end', () => {
          resolve(results);
        });
    });
  }
}
