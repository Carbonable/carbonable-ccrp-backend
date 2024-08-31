import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';
import { Prisma } from '@prisma/client';

type Developper = Prisma.DevelopperGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
  };
}>;

const DEVELOPPER_TABLE = 'developper';

@Injectable()
export class DevelopperService {
  private readonly logger = new Logger(DevelopperService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly csv: CsvService,
  ) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    const data = await this.csv.parseCSV<Developper>(
      fileBuffer,
      this.createDevelopper.bind(this),
    );
    this.logger.log('Creating Developper', data);

    await this.prisma.createManyOfType(DEVELOPPER_TABLE, data);
    return { message: 'Developper uploaded successfully' };
  }

  async getDeveloppers(): Promise<Developper[]> {
    return this.prisma.developper.findMany();
  }

  private createDevelopper(data: any): Developper {
    return {
      id: this.csv.nonNullString(data, 'id'),
      name: this.csv.nonNullString(data, 'name'),
      slug: this.csv.nonNullString(data, 'slug'),
    };
  }
}
