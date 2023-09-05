import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import Utils from '../../utils';

export const ProjectedDecarbonationViewType = {
  OFFSET_TYPE: 'OFFSET_TYPE',
  PROJECT_TYPE: 'PROJECT_TYPE',
  INVESTMENT_TYPE: 'INVESTMENT_TYPE',
};

type GlobalData = {
  total_invested: string;
  generated_cc: string;
  forecasted_cc: string;
  retired_cc: string;
};

function defaultGlobalData(): GlobalData {
  return {
    total_invested: '$ -',
    generated_cc: '- t',
    forecasted_cc: '- t',
    retired_cc: '- t',
  };
}

@Injectable()
export class GlobalDataService {
  private readonly logger = new Logger(GlobalDataService.name);

  constructor(private prisma: PrismaService) {}

  async get(): Promise<GlobalData> {
    // TODO: generated_cc only forward finance project
    const data = await this.prisma.$queryRaw<GlobalData[]>`
SELECT
    SUM(p.funding_amount) + coalesce((SELECT SUM(cc.purchase_price) FROM carbon_credits cc where cc.is_purchased = true), 0) as total_invested,
    (SELECT SUM(cp.absorption) from curve_point cp where cp.project_id = p.id and cp.time < now() and p.origin = 'FORWARD_FINANCE') as generated_cc,
    (SELECT SUM(cp.absorption) from curve_point cp where cp.project_id = p.id and cp.time > now()) as forecasted_cc,
    (SELECT COUNT(cc.id) FROM carbon_credits cc WHERE cc.is_retired) as retired_cc
FROM projects p
GROUP BY p.id
;
        `;
    if (0 === data.length) {
      this.logger.error('Failed to get global data (no rows returned)');
      return defaultGlobalData();
    }

    const globalData = data.reduce(
      (acc: any, row: any) => ({
        total_invested:
          parseInt(acc.total_invested) + parseInt(row.total_invested),
        generated_cc: parseInt(acc.generated_cc) + parseInt(row.generated_cc),
        forecasted_cc:
          parseInt(acc.forecasted_cc) + parseInt(row.forecasted_cc),
        retired_cc: parseInt(acc.retired_cc) + parseInt(row.retired_cc),
      }),
      {
        total_invested: 0,
        generated_cc: 0,
        forecasted_cc: 0,
        retired_cc: 0,
      },
    );

    return {
      total_invested: Utils.formatString({
        value: globalData.total_invested.toString(),
        prefix: '$',
      }),
      generated_cc: Utils.formatString({
        value: globalData.generated_cc.toString(),
        suffix: 't',
      }),
      forecasted_cc: Utils.formatString({
        value: globalData.forecasted_cc.toString(),
        suffix: 't',
      }),
      retired_cc: Utils.formatString({
        value: globalData.retired_cc.toString(),
        suffix: 't',
      }),
    };
  }
}
