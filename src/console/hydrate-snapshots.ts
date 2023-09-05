import { Command, CommandRunner } from 'nest-commander';
import { PrismaService } from '../infrastructure/prisma.service';
import { Logger } from '@nestjs/common';
import { monotonicFactory } from 'ulid';

const ulid = monotonicFactory();

@Command({
  name: 'hydrate:snapshots',
})
export class SnapshotHydratorCommand extends CommandRunner {
  private readonly logger = new Logger(SnapshotHydratorCommand.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async run(inputs: string[], options: Record<string, any>): Promise<void> {
    this.logger.log('Hydrating snapshots...');
    const currentYear = new Date().getFullYear();
    // foreach company
    // foreach year - vintage
    // find all cc and create a snapshot for the given year
    await this.prisma
      .$queryRaw`TRUNCATE TABLE projection_snapshot RESTART IDENTITY CASCADE;`;

    const companies = await this.prisma.company.findMany({
      where: {
        emissions: { some: { year: { gt: currentYear.toString() } } },
      },
      include: {
        emissions: true,
      },
    });

    for (const company of companies) {
      for (const emission of company.emissions) {
        const cc_data = await this.prisma.$queryRaw<
          {
            ex_post_count: string;
            ex_ante_count: string;
            confirmed_count: string;
          }[]
        >`
SELECT
    (SELECT COUNT(cc.id) FROM carbon_credits cc INNER JOIN projects p on p.id = cc.project_id where cc.audit_status = 'AUDITED' and p.company_id = ${company.id}) as ex_post_count,
    (SELECT COUNT(cc.id) FROM carbon_credits cc INNER JOIN projects p on p.id = cc.project_id where cc.audit_status = 'CONFIRMED' and p.company_id = ${company.id}) as confirmed_count,
    (SELECT COUNT(cc.id) FROM carbon_credits cc INNER JOIN projects p on p.id = cc.project_id where cc.audit_status = 'PROJECTED' and p.company_id = ${company.id}) as ex_ante_count
;
            `;
        const value = cc_data.pop();
        await this.prisma.projectionSnapshot.create({
          data: {
            id: ulid().toString(),
            vintage: emission.year,
            target: emission.target,
            emissions: emission.emission,
            effectiveCompensation: 0,
            exAnteCount: parseInt(value.ex_ante_count),
            exPostCount: parseInt(value.ex_post_count),
            confirmedCount: parseInt(value.confirmed_count),
            averagePurchasedPrice: 0,
            totalPurchasedPrice: 0,
            averageIssuedPrice: 0,
            totalIssuedPrice: 0,
            granTotalAmount: 0,
            emissionDebtEstimated: 0,
            companyId: company.id,
          },
        });
      }
    }
    this.logger.log('Finished hydrating snapshots');
    process.exit(0);
  }
}
