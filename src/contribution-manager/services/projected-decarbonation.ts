import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { PaginationDTO } from '../resolvers/carbon-credits';
import Utils from '../../utils';
import {
  HistoricalProjectionSnapshot,
  ProjectionSnapshot,
} from '@prisma/client';

type DecarbonationVintage = {
  year: string;
  emissions: string;
  target: string;
};
type CarbonCreditProjection = {
  received_cc: number;
  purchased_cc: number;
  forward_cc: number;
  retired_cc: number;
};

type AnualProjectedDecarbonation = {
  timePeriod: string;
  emissions: string;
  exPostIssued: number;
  exPostPurchased: number;
  exPostRetired: number;
  neutralityTarget: number;
  actualRate: number;
  delta: number;
  debt: number;
  exPostStock: number;
  exAnteStock: number;
};

type CumulativeProjectedDecarbonation = {
  timePeriod: string;
  emissions: string;
  exPostIssued: number;
  exPostPurchased: number;
  exPostRetired: number;
  delta: number;
  emissionDebt: number;
};

type FinancialAnalysisProjectedDecarbonation = {
  timePeriod: string;
  averagePurchasePrice: number;
  cumulativeAveragePurchasePrice: number;
  totalPurchasedAmount: number;
  cumulativePurchasedAmount: number;
  averageIssuedPrice: number;
  cumulativeAverageIssuedPrice: number;
  totalIssuedAmount: number;
  cumulativeTotalIssuedAmount: number;
  granTotalAmount: number;
  cumulativeGranTotalAmount: number;
  emissionDebtEstimatedAmount: number;
  cumulativeEmissionDebtEstimatedAmount: number;
};

type ProjectedDecarbonationWithPagination = {
  data: string[];
  pagination: {
    max_page: number;
    page_number: number;
    count: number;
  };
};

type GraphDataKv = {
  key: string;
  value: number;
};
type ProjectedDecarbonationGraph = DecarbonationVintage & {
  emission: number;
  target: number;
  data: GraphDataKv[];
};

type DataFilter = { filter?: string; page?: number; count?: number };

@Injectable()
export class ProjectedDecarbonationService {
  private readonly logger = new Logger(ProjectedDecarbonationService.name);

  constructor(private prisma: PrismaService) {}

  async get(filter: string): Promise<ProjectedDecarbonationGraph[]> {
    // TODO: Change this to be based on min and max vintage of CC
    const historicalSnapshots =
      await this.prisma.historicalProjectionSnapshot.findMany();
    const snapshots = await this.prisma.projectionSnapshot.findMany();

    const mergedSnapshots = [...historicalSnapshots, ...snapshots];

    return mergedSnapshots.map((s) => toProjectedDecarbonationGraph(s));
  }

  async getTable(
    pagination: PaginationDTO,
  ): Promise<ProjectedDecarbonationWithPagination> {
    return await this.getData({ ...pagination });
  }

  // This is kinda not very optimised but we're limited by sql for the moment
  // TODO: have some kind of aggregation table.
  private async getData({
    page = 1,
    count = 50,
  }: DataFilter): Promise<ProjectedDecarbonationWithPagination> {
    const offset = (page - 1) * count;
    const years = await this.prisma.$queryRaw<DecarbonationVintage[]>`
SELECT
    cc.vintage as year,
    coalesce((SELECT SUM(ce.emission) from company_emission ce where ce.year = cc.vintage), 0) as emissions,
    coalesce((SELECT SUM(ce.target) from company_emission ce where ce.year = cc.vintage), 0) as target
FROM carbon_credits cc
GROUP BY cc.vintage ORDER BY cc.vintage LIMIT ${count} OFFSET ${offset}
;
        `;

    let computedYears = [];
    for (const year of years) {
      const yearValue = year.year;
      const cc_data = await this.prisma.$queryRaw<CarbonCreditProjection[]>`
SELECT
    (SELECT COUNT(cc.id) FROM carbon_credits cc where is_purchased = true and cc.vintage = '${yearValue}') as purchased_cc,
    (SELECT COUNT(cc.id) FROM carbon_credits cc where is_retired = true and cc.vintage = '${yearValue}') as retired_cc,
    (
        SELECT SUM(cp.absorption) FROM curve_point cp where cp.time between '${yearValue}-01-01 00:00:00' and '${yearValue}-12-31 23:59:59'
    ) as received_cc,
    (
        SELECT SUM(cp.absorption) FROM curve_point cp where cp.time > '${yearValue}-12-31 23:59:59'
    ) as forward_cc
;
            `;

      const d = cc_data.pop();
      computedYears = [
        ...computedYears,
        {
          year: year.year,
          emissions: Utils.formatString({
            value: year.emissions,
            suffix: 'kt',
          }),
          target: Utils.formatString({ value: year.target, suffix: '%' }),
          received_cc: Utils.formatString({
            value: d.received_cc.toString(),
            suffix: 'kt',
          }),
          purchased_cc: Utils.formatString({
            value: d.purchased_cc.toString(),
            suffix: 'kt',
          }),
          retired_cc: Utils.formatString({
            value: d.retired_cc.toString(),
            suffix: 'kt',
          }),
          forward_cc: Utils.formatString({
            value: d.forward_cc.toString(),
            suffix: 'kt',
          }),
        },
      ];
    }

    const company_emission_count = await this.prisma.$queryRaw<
      { count: number }[]
    >`
SELECT COUNT(ce.year)
FROM company_emission ce
INNER JOIN company c on c.id = ce.company_id
INNER JOIN projects p on p.company_id = c.id
GROUP BY ce.year
        `;
    const paginationObject = {
      max_page: Math.ceil(company_emission_count.length / count),
      page_number: page,
      count: count,
    };

    return { data: computedYears, pagination: paginationObject };
  }

  async resolveFilterQuery(filter: string, year: string) {
    const filters = {
      PROJECT_TYPE: this.resolveProject.bind(this),
      OFFSET_TYPE: this.resolveOffset.bind(this),
      INVESTMENT_TYPE: this.resolveInvestment.bind(this),
    };
    const filterFn = filters[filter];
    if (!filterFn) {
      throw new Error('Invalid filter provided');
    }

    return await filterFn(year);
  }

  async resolveProject(year: string) {
    const cc_data = await this.prisma.$queryRaw<
      { redd_plus_count: number; arr_count: number }[]
    >`
SELECT
    (SELECT COUNT(cc.id) FROM carbon_credits cc where cc.type = 'CONCERVATION' and cc.vintage = ${year}) as redd_plus_count,
    (SELECT COUNT(cc.id) FROM carbon_credits cc where cc.type = 'RESTORATION' and cc.vintage = ${year}) as arr_count
;
            `;

    const value = cc_data.pop();

    return [
      { key: 'REDD+', value: parseInt(value.redd_plus_count.toString()) },
      { key: 'ARR', value: parseInt(value.arr_count.toString()) },
    ];
  }

  async resolveOffset(year: string) {
    const cc_data = await this.prisma.$queryRaw<
      {
        ex_post_count: number;
        ex_ante_count: number;
        confirmed_count: number;
      }[]
    >`
SELECT
    (SELECT COUNT(cc.id) FROM carbon_credits cc where cc.audit_status = 'AUDITED') as ex_post_count,
    (SELECT COUNT(cc.id) FROM carbon_credits cc where cc.audit_status = 'CONFIRMED') as confirmed_count,
    (SELECT COUNT(cc.id) FROM carbon_credits cc where cc.audit_status = 'PROJECTED') as ex_ante_count
;
            `;

    const value = cc_data.pop();

    return [
      { key: 'ExPost', value: parseInt(value.ex_post_count.toString()) },
      { key: 'Confirmed', value: parseInt(value.confirmed_count.toString()) },
      { key: 'ExAnte', value: parseInt(value.ex_ante_count.toString()) },
    ];
  }

  async resolveInvestment(year: string) {
    const cc_data = await this.prisma.$queryRaw<
      { direct_purchase_count: number; forward_finance_count: number }[]
    >`
SELECT
    (SELECT COUNT(cc.id) FROM carbon_credits cc INNER JOIN projects p on p.id = cc.project_id where p.origin = 'DIRECT_PURCHASE' and cc.vintage = ${year}) as direct_purchase_count,
    (SELECT COUNT(cc.id) FROM carbon_credits cc INNER JOIN projects p on p.id = cc.project_id where p.origin = 'FORWARD_FINANCE' and cc.vintage = ${year}) as forward_finance_count
;
            `;
    const value = cc_data.pop();
    return [
      {
        key: 'Forward Finance',
        value: parseInt(value.forward_finance_count.toString()),
      },
      {
        key: 'Direct Purchase',
        value: parseInt(value.direct_purchase_count.toString()),
      },
    ];
  }
}

function toProjectedDecarbonationGraph(
  snapshot: ProjectionSnapshot | HistoricalProjectionSnapshot,
): ProjectedDecarbonationGraph {
  return {
    year: snapshot.vintage,
    emissions: snapshot.emissions.toString(),
    // @ts-ignore
    target: Number(snapshot.target),
    data: [
      { key: 'ExPost', value: Number(snapshot.exPostCount) },
      { key: 'Confirmed', value: Number(snapshot.confirmedCount) },
      { key: 'ExAnte', value: Number(snapshot.exAnteCount) },
    ],
  };
}
