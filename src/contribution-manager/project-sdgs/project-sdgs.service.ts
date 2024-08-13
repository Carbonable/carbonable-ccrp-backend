import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';

export type ProjectSdgs = Prisma.ProjectsSdgsGetPayload<{
  include: {
    project: false;
    sdg: false;
  };
}>;
export const PROJECT_SDGS_TABLE = 'projectsSdgs';
@Injectable()
export class ProjectSdgsService {
  logger = new Logger(ProjectSdgsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly csv: CsvService,
  ) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    const data = await this.csv.parseCSV<ProjectSdgs>(
      fileBuffer,
      this.createProjectSdgs.bind(this),
    );

    await this.prisma.createManyOfType(PROJECT_SDGS_TABLE, data);
    return { message: 'ProjectSdgs uploaded successfully' };
  }

  private createProjectSdgs(data: any): ProjectSdgs {
    return {
      projectId: this.csv.nonNullString(data, 'project_id'),
      sdgId: this.csv.nonNullString(data, 'sdg_id'),
    };
  }
}
