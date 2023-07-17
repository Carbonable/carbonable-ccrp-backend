import { Logger } from "@nestjs/common";
import { Args, ArgsType, Field, Int, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { CarbonCredit, Project } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { GlobalDataService, ImpactMetricsService, ProjectFundingAllocationService, ProjectMetricsService, ProjectedDecarbonationService } from "src/services";
import { monotonicFactory } from "ulid";

const ulid = monotonicFactory();

@ArgsType()
export class PaginationDTO {
    @Field(() => Int)
    page = 1

    @Field(() => Int)
    count = 10
}

@Resolver('CarbonCredit')
export class CarbonCreditResolver {
    private readonly logger = new Logger(CarbonCreditResolver.name);

    constructor(
        private prisma: PrismaService,
        private globalDataService: GlobalDataService,
        private projectedDecarbonation: ProjectedDecarbonationService,
        private projectFundingAllocation: ProjectFundingAllocationService,
        private projectMetrics: ProjectMetricsService,
        private impactMetrics: ImpactMetricsService,
    ) { }

    @ResolveField()
    async project(@Parent() carbonCredit: CarbonCredit) {
        let { id } = carbonCredit;
        return this.prisma.project.findUnique({ where: { id } });
    }

    @Query('getGlobalData')
    async getGlobalData() {
        return await this.globalDataService.get();
    }

    @Query('getProjectedDecarbonation')
    async getProjectedDecarbonation(@Args('viewType') filter: string) {
        return await this.projectedDecarbonation.get(filter);
    }

    @Query('getProjectedDecarbonationTable')
    async getProjectedDecarbonationTable(@Args('pagination') pagination: PaginationDTO) {
        if (undefined === pagination) {
            pagination = new PaginationDTO();
        }
        return await this.projectedDecarbonation.getTable(pagination);
    }

    @Query('getProjectFundingAllocation')
    async getProjectFundingAllocation(@Args('pagination') pagination: PaginationDTO) {
        if (undefined === pagination) {
            pagination = new PaginationDTO();
        }
        return await this.projectFundingAllocation.get(pagination);
    }

    @Query('getProjectMetrics')
    async getProjectMetrics() {
        return await this.projectMetrics.get();
    }

    @Query('getImpactMetrics')
    async getImpactMetrics() {
        return await this.impactMetrics.get();
    }
}
