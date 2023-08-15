import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { PaginationDTO } from "src/resolvers/carbon-credits";
import Utils from "src/utils";

type DecarbonationVintage = {
    year: string,
    emissions: string,
    target: string,
};
type CarbonCreditProjection = {
    received_cc: string,
    purchased_cc: string,
    forward_cc: string,
    retired_cc: string,
};

type ProjectedDecarbonation = DecarbonationVintage & CarbonCreditProjection;
type ProjectedDecarbonationWithPagination = {
    data: ProjectedDecarbonation[],
    pagination: {
        max_page: number,
        page_number: number,
        count: number,
    }
};

type GraphDataKv = {
    key: string,
    value: number,
};
type ProjectedDecarbonationGraph = DecarbonationVintage & {
    emission: number,
    target: number
    data: GraphDataKv[],
}

type DataFilter = { filter?: string, page?: number, count?: number };


@Injectable()
export class ProjectedDecarbonationService {
    private readonly logger = new Logger(ProjectedDecarbonationService.name);

    constructor(private prisma: PrismaService) { }

    async get(filter: string): Promise<ProjectedDecarbonationGraph[]> {
        let years = await this.prisma.$queryRaw<DecarbonationVintage[]>`
SELECT
    ce.year,
    SUM(ce.emission) as emissions,
    SUM(ce.target) / COUNT(ce.id) as target
FROM company_emission ce
INNER JOIN company c on c.id = ce.company_id
INNER JOIN projects p on p.company_id = c.id
GROUP BY ce.year ORDER BY ce.year
;
        `;

        let computedYears = [];
        for (let year of years) {

            let cc_data = await this.resolveFilterQuery(filter, year.year);

            computedYears = [...computedYears, {
                ...year,
                emissions: parseInt(year.emissions),
                target: parseInt(year.target),
                data: cc_data,
            }];
        }

        return computedYears;
    }

    async getTable(pagination: PaginationDTO): Promise<ProjectedDecarbonationWithPagination> {
        return await this.getData({ ...pagination });
    }

    // This is kinda not very optimised but we're limited by sql for the moment
    // TODO: have some kind of aggregation table.
    private async getData({ filter, page = 1, count = 50 }: DataFilter): Promise<ProjectedDecarbonationWithPagination> {
        let offset = (page - 1) * count;
        let years = await this.prisma.$queryRaw<DecarbonationVintage[]>`
SELECT
    ce.year,
    SUM(ce.emission) as emissions,
    SUM(ce.target) / COUNT(ce.id) as target
FROM company_emission ce
INNER JOIN company c on c.id = ce.company_id
INNER JOIN projects p on p.company_id = c.id
GROUP BY ce.year ORDER BY ce.year LIMIT ${count} OFFSET ${offset}
;
        `;

        let computedYears = [];
        for (let year of years) {
            let cc_data = await this.prisma.$queryRaw<CarbonCreditProjection[]>`
SELECT
    (SELECT COUNT(cc.id) FROM carbon_credits cc where is_purchased = true and cc.vintage = '${year.year}') as purchased_cc,
    (SELECT COUNT(cc.id) FROM carbon_credits cc where is_retired = true and cc.vintage = '${year.year}') as retired_cc,
    (
        SELECT SUM(cp.absorption) FROM curve_point cp where cp.time between '${year.year}-01-01 00:00:00' and '${year.year}-12-31 23:59:59'
    ) as received_cc,
    (
        SELECT SUM(cp.absorption) FROM curve_point cp where cp.time > '${year.year}-12-31 23:59:59'
    ) as forward_cc
;
            `;

            let d = cc_data.pop();
            computedYears = [...computedYears, {
                year: year.year,
                emissions: Utils.formatString({ value: year.emissions, suffix: 'kt' }),
                target: Utils.formatString({ value: year.target, suffix: '%' }),
                received_cc: Utils.formatString({ value: d.received_cc, suffix: 'kt' }),
                purchased_cc: Utils.formatString({ value: d.purchased_cc, suffix: 'kt' }),
                retired_cc: Utils.formatString({ value: d.retired_cc, suffix: 'kt' }),
                forward_cc: Utils.formatString({ value: d.forward_cc, suffix: 'kt' }),
            }];
        }

        let company_emission_count = await this.prisma.$queryRaw<{ count: number }[]>`
SELECT COUNT(ce.year)
FROM company_emission ce
INNER JOIN company c on c.id = ce.company_id
INNER JOIN projects p on p.company_id = c.id
GROUP BY ce.year
        `;
        let paginationObject = {
            max_page: Math.ceil(company_emission_count.length / count),
            page_number: page,
            count: count,
        };


        return { data: computedYears, pagination: paginationObject };
    }

    async resolveFilterQuery(filter: string, year: string) {
        let filters = {
            "PROJECT_TYPE": this.resolveProject.bind(this),
            "OFFSET_TYPE": this.resolveOffset.bind(this),
            "INVESTMENT_TYPE": this.resolveInvestment.bind(this),
        };
        let filterFn = filters[filter];
        if (!filterFn) {
            throw new Error('Invalid filter provided');
        }

        return await filterFn(year);
    }

    async resolveProject(year: string) {
        let cc_data = await this.prisma.$queryRaw<{ redd_plus_count: number, arr_count: number }[]>`
SELECT
    (SELECT COUNT(cc.id) FROM carbon_credits cc where cc.type = 'CONCERVATION' and cc.vintage = ${year}) as redd_plus_count,
    (SELECT COUNT(cc.id) FROM carbon_credits cc where cc.type = 'RESTORATION' and cc.vintage = ${year}) as arr_count
;
            `;

        let value = cc_data.pop();

        return [
            { key: 'REDD+', value: parseInt(value.redd_plus_count.toString()) },
            { key: 'ARR', value: parseInt(value.arr_count.toString()) },
        ];
    }

    async resolveOffset(year: string) {
        let currentYear = new Date().getFullYear();
        let cc_data = await this.prisma.$queryRaw<{ ex_post_count: number, ex_ante_count: number }[]>`
SELECT
    (SELECT COUNT(cc.id) FROM carbon_credits cc where cast(cc.vintage as int) <= ${currentYear} and cc.vintage = ${year}) as ex_post_count,
    (SELECT COUNT(cc.id) FROM carbon_credits cc where cast(cc.vintage as int) > ${currentYear} and cc.vintage = ${year}) as ex_ante_count
;
            `;

        let value = cc_data.pop();

        return [
            { key: 'ExPost', value: parseInt(value.ex_post_count.toString()) },
            { key: 'ExAnte', value: parseInt(value.ex_ante_count.toString()) },
        ];
    }

    async resolveInvestment(year: string) {
        let cc_data = await this.prisma.$queryRaw<{ direct_purchase_count: number, forward_finance_count: number }[]>`
SELECT
    (SELECT COUNT(cc.id) FROM carbon_credits cc INNER JOIN projects p on p.id = cc.project_id where p.origin = 'DIRECT_PURCHASE' and cc.vintage = ${year}) as direct_purchase_count,
    (SELECT COUNT(cc.id) FROM carbon_credits cc INNER JOIN projects p on p.id = cc.project_id where p.origin = 'FORWARD_FINANCE' and cc.vintage = ${year}) as forward_finance_count
;
            `;
        let value = cc_data.pop();
        return [
            { key: 'Forward Finance', value: parseInt(value.forward_finance_count.toString()) },
            { key: 'Direct Purchase', value: parseInt(value.direct_purchase_count.toString()) }
        ];
    }
}
