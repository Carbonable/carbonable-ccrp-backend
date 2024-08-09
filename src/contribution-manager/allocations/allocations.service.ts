import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';
import { Prisma } from '@prisma/client';

type Allocation = Prisma.AllocationGetPayload<{
  include: {
    project: false;
    businessUnit: false;
  };
}>;

const ALLOCATION_TABLE = 'allocation';

@Injectable()
export class AllocationService {
  private readonly logger = new Logger(AllocationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly csv: CsvService,
  ) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    const data = await this.csv.parseCSV<Allocation>(
      fileBuffer,
      this.createAllocation.bind(this),
    );
    await this.prisma.createManyOfType(ALLOCATION_TABLE, data);
    return { message: 'Allocations uploaded successfully' };
  }

  private createAllocation(data: any): Allocation {
    return {
      id: this.csv.nonNullString(data, 'id'),
      quantity: this.csv.parseIntSafe(data.quantity),
      allocatedAt: this.csv.parseDateSafe(data.allocated_at),
      businessUnitId: this.csv.nonNullString(data, 'business_unit_id'),
      projectId: this.csv.nonNullString(data, 'project_id'),
    };
  }
}
