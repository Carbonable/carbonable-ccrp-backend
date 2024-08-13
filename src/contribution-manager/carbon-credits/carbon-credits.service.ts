import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';
import { Prisma } from '@prisma/client';

type CarbonCredit = Prisma.CarbonCreditGetPayload<{
  include: {
    project: false;
    Allocation: false;
  };
}>;

const CARBON_CREDIT_TABLE = 'carbon-credit';

@Injectable()
export class CarbonCreditService {
  private readonly logger = new Logger(CarbonCreditService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly csv: CsvService,
  ) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    const data = await this.csv.parseCSV<CarbonCredit>(
      fileBuffer,
      this.createCarbonCredit.bind(this),
    );

    await this.prisma.createManyOfType(CARBON_CREDIT_TABLE, data);
    return { message: 'CarbonCredits uploaded successfully' };
  }

  private createCarbonCredit(data: any): CarbonCredit {
    return {
      id: this.csv.nonNullString(data, 'id'),
      number: this.csv.nonNullString(data, 'number'),
      vintage: this.csv.nonNullString(data, 'vintage'),
      type: this.csv.checkAndParseCarbonCreditType(data.type),
      origin: this.csv.checkAndParseCarbonCreditOrigin(data.origin),
      purchasePrice: data.purchase_price ? BigInt(data.purchase_price) : null,
      isRetired: this.csv.parseBool(data.is_retired),
      isLocked: this.csv.parseBool(data.is_locked),
      isPurchased: this.csv.parseBool(data.is_purchased),
      auditStatus: this.csv.checkAndParseAuditStatus(data.audit_status),
      projectId: this.csv.nonNullString(data, 'project_id'),
      allocationId: data.allocationId || null,
    };
  }
}
