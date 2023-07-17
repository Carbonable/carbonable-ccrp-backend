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

type DataFilter = { filter?: string, page?: number, count?: number };

@Injectable()
export class ProjectedDecarbonationService {
    private readonly logger = new Logger(ProjectedDecarbonationService.name);

    constructor(private prisma: PrismaService) { }

    async get(filter: string): Promise<ProjectedDecarbonation[]> {
        return await this.getData({ filter: filter });
    }
    async getTable(pagination: PaginationDTO): Promise<ProjectedDecarbonation[]> {
        return await this.getData({ ...pagination });
    }

    // This is kinda not very optimised but we're limited by sql for the moment
    // TODO: have some kind of aggregation table.
    private async getData({ filter, page = 1, count = 50 }: DataFilter): Promise<ProjectedDecarbonation[]> {
        let offset = (page - 1) * count;
        let years = await this.prisma.$queryRaw<DecarbonationVintage[]>`
SELECT
    pc.year,
    SUM(pc.emission) as emissions,
    SUM(pc.target) / COUNT(pc.id) as target
FROM project_configuration pc
INNER JOIN projects p on pc.project_id = p.id
GROUP BY pc.year ORDER BY pc.year LIMIT ${count} OFFSET ${offset}
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

        return computedYears;
    }
}
