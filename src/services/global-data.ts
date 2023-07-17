import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import Utils from "src/utils";

export const ProjectedDecarbonationViewType = {
    OFFSET_TYPE: 'OFFSET_TYPE',
    PROJECT_TYPE: 'PROJECT_TYPE',
    INVESTMENT_TYPE: 'INVESTMENT_TYPE',
};

type GlobalData = {
    total_invested: string,
    generated_cc: string,
    forecasted_cc: string,
    retired_cc: string,
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

    constructor(private prisma: PrismaService) { }

    async get(): Promise<GlobalData> {
        let data = await this.prisma.$queryRaw<GlobalData[]>`
SELECT
    SUM(p.funding_amount) + (SELECT SUM(cc.purchase_price) FROM carbon_credits cc) as total_invested,
    SUM(absorbed_cp.absorption) as generated_cc,
    SUM(forwarded_cp.absorption) as forecasted_cc,
    (SELECT COUNT(cc.id) FROM carbon_credits cc WHERE cc.is_retired) as retired_cc
FROM projects p
INNER JOIN curve_point absorbed_cp on p.id = absorbed_cp.project_id and absorbed_cp.time < now()
INNER JOIN curve_point forwarded_cp on p.id = forwarded_cp.project_id and forwarded_cp.time > now()
;
        `;
        if (0 === data.length) {
            this.logger.error('Failed to get global data (no rows returned)');
            return defaultGlobalData();
        }

        let globalData = data[0];
        return {
            total_invested: Utils.formatString({ value: globalData.total_invested, prefix: '$' }),
            generated_cc: Utils.formatString({ value: globalData.generated_cc, suffix: 't' }),
            forecasted_cc: Utils.formatString({ value: globalData.forecasted_cc, suffix: 't' }),
            retired_cc: Utils.formatString({ value: globalData.retired_cc, suffix: 't' }),
        };
    }
}
