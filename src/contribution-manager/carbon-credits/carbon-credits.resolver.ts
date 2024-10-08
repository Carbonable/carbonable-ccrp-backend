import { Logger } from '@nestjs/common';
import {
  Args,
  ArgsType,
  Field,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CarbonCredit } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma.service';
import {
  GlobalDataService,
  ImpactMetricsService,
  ProjectFundingAllocationService,
  ProjectMetricsService,
  CarbonAssetAllocationService,
} from '../services';
import { VisualizationViewType } from '../../schemas/graphql.autogenerated';
import { Public } from '../../auth/auth.public.decorator';

@ArgsType()
export class PaginationDTO {
  @Field(() => Int)
  page = 1;

  @Field(() => Int)
  count = 10;
}

export const CARBONABLE_COMPANY_ID = '01H5739RTVV0JV8M3DAN0C10ME';

@Resolver('CarbonCredit')
export class CarbonCreditResolver {
  private readonly logger = new Logger(CarbonCreditResolver.name);

  constructor(
    private prisma: PrismaService,
    private globalDataService: GlobalDataService,
    private projectFundingAllocation: ProjectFundingAllocationService,
    private projectMetrics: ProjectMetricsService,
    private impactMetrics: ImpactMetricsService,
    private carbonAssetAllocationService: CarbonAssetAllocationService,
  ) {}

  @Public()
  @ResolveField()
  async project(@Parent() carbonCredit: CarbonCredit) {
    const { id } = carbonCredit;
    return this.prisma.project.findUnique({ where: { id } });
  }

  @Public()
  @Query('getGlobalData')
  async getGlobalData(@Args('view') view: any) {
    this.logger.log(` View: ${JSON.stringify(view)}`);
    return await this.globalDataService.get(view as VisualizationViewType);
  }

  @Public()
  @Query()
  async getProjectFundingAllocation(@Args('pagination') pagination: any) {
    return await this.projectFundingAllocation.get(
      (pagination as PaginationDTO) || new PaginationDTO(),
    );
  }

  @Public()
  @Query('getProjectMetrics')
  async getProjectMetrics(@Args('view') view: any) {
    return await this.projectMetrics.get(view as VisualizationViewType);
  }

  @Public()
  @Query('getImpactMetrics')
  async getImpactMetrics(@Args('view') view: any) {
    return await this.impactMetrics.get(view as VisualizationViewType);
  }

  @Public()
  @Query('companyCarbonAssetAllocation')
  async companyCarbonAssetAllocation(
    @Args('id') id: string,
    @Args('pagination') pagination: any,
  ) {
    return await this.carbonAssetAllocationService.getCompanyWide(
      id,
      (pagination as PaginationDTO) || new PaginationDTO(),
    );
  }

  @Public()
  @Query('projectCarbonAssetAllocation')
  async projectCarbonAssetAllocation(
    @Args('id') id: string,
    @Args('pagination') pagination: any,
  ) {
    return await this.carbonAssetAllocationService.getProject(
      id,
      (pagination as PaginationDTO) || new PaginationDTO(),
    );
  }

  @Public()
  @Query('businessUnitCarbonAssetAllocation')
  async businessUnitCarbonAssetAllocation(
    @Args('id') id: string,
    @Args('pagination') pagination: any,
  ) {
    return await this.carbonAssetAllocationService.getBusinessUnit(
      id,
      (pagination as PaginationDTO) || new PaginationDTO(),
    );
  }
}
