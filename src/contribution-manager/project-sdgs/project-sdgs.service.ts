import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';

export type ProjectSdgs = Prisma.ProjectsSdgsGetPayload<{
  include: {
    project: false;
    sdg: false;
  };
}>;
export const PROJECT_SDGS_MODEL = 'projectsSdgs';
@Injectable()
export class ProjectSdgsService {
  logger = new Logger(ProjectSdgsService.name);
  constructor(private prisma: PrismaService, private csv: CsvService) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    let records: ProjectSdgs[];
    try {
      records = await this.csv.parseCsvToArrayOfStrMap<ProjectSdgs>(fileBuffer);
      this.logger.debug(`ProjectSdgs: ${JSON.stringify(records)}`);
    } catch (error) {
      this.logger.error(`Error parsing CSV file: ${error}`);
      throw new BadRequestException('Invalid file format');
    }

    await this.prisma.createManyOfType(PROJECT_SDGS_MODEL, records);

    return { message: `ProjectSdgs uploaded successfully` };
  }
}
