import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Logger } from '@nestjs/common';
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

export const PROJECT_TABLE = 'project';
@Injectable()
export class ProjectService {
  logger = new Logger(ProjectService.name);
  constructor(private prisma: PrismaService, private csv: CsvService) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    const data = await this.csv.parseCSV(
      fileBuffer,
      this.createProject.bind(this),
    );

    await this.prisma.createManyOfType(PROJECT_TABLE, data);

    return { message: `Projects uploaded successfully` };
  }

  async getProjects(): Promise<Project[]> {
    return this.prisma.project.findMany({
      include: {
        carbonCredits: false,
        certifier: true,
        developper: true,
        country: true,
        company: true,
        projectsSdgs: true,
        stock: false,
        vintages: false,
        allocations: false,
      },
    });
  }
  private createProject(data: any): Project {
    return {
      id: this.csv.nonNullString(data, 'id'),
      name: this.csv.nonNullString(data, 'name'),
      slug: this.csv.nonNullString(data, 'slug'),
      description: this.csv.nonNullString(data, 'description'),
      localization: this.csv.nonNullString(data, 'localization'),
      startDate: this.csv.nonNullString(data, 'start_date'),
      endDate: this.csv.nonNullString(data, 'end_date'),
      area: this.csv.parseIntSafe(data.area),
      type: this.csv.checkAndParseCarbonCreditType(data.type),
      origin: this.csv.checkAndParseCarbonCreditOrigin(data.origin),
      fundingAmount: this.csv.parseFloatSafe(data.funding_amount),
      color: this.csv.checkAndParseProjectColor(data.color),
      protectedSpecies: this.csv.parseIntSafe(data.protected_species),
      protectedForest: this.csv.parseIntSafe(data.protected_forest),
      riskAnalysis: this.csv.nonNullString(data, 'risk_analysis'),
      metadata: this.csv.parseJSONSafe(data.metadata),
      certifierId: !data.certifier_id ? null : data.certifier_id,
      developperId: !data.developper_id ? null : data.developper_id,
      countryId: this.csv.nonNullString(data, 'country_id'),
      companyId: this.csv.nonNullString(data, 'company_id'),
    };
  }
}
