import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { PaginationDTO } from "src/resolvers/carbon-credits";
import Utils from "src/utils";

type Allocation = {
    id: string,
    name: string,
    allocation: string,
    generated_cc: string,
    forwarded_cc: string,
    retired_cc: string,
    comitted_cc: string,
};

@Injectable()
export class ProjectFundingAllocationService {

    constructor(private prismaClient: PrismaService) { }

    async get(pagination: PaginationDTO) {
        let { page = 1, count = 10 } = pagination;
        let allocations = await this.prismaClient.$queryRaw<Allocation[]>`
SELECT
    p.id,
    p.allocation,
    p.name,
    (SELECT SUM(cp.absorption) from curve_point cp where cp.project_id = p.id and cp.time < now()) as generated_cc,
    (SELECT SUM(cp.absorption) from curve_point cp where cp.project_id = p.id and cp.time > now()) as forwarded_cc,
    (SELECT COUNT(cc.id) FROM carbon_credits cc WHERE cc.is_retired and cc.project_id = p.id) as retired_cc,
    (SELECT COUNT(cc.id) FROM carbon_credits cc WHERE cc.is_locked and cc.project_id = p.id) as comitted_cc
FROM projects p
LIMIT ${count} OFFSET ${(page - 1) * count}
;
        `;

        return allocations.map(a => ({
            ...a,
            allocation: Utils.formatString({ value: a.allocation, suffix: '%' }),
            generated_cc: Utils.formatString({ value: a.generated_cc, suffix: 'cc' }),
            forwarded_cc: Utils.formatString({ value: a.forwarded_cc, suffix: 'cc' }),
            retired_cc: Utils.formatString({ value: a.retired_cc, suffix: 'cc' }),
            comitted_cc: Utils.formatString({ value: a.comitted_cc, suffix: 'cc' }),
        }));
    }
}
