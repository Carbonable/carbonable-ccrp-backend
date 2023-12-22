import { Inject, Logger } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Project } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma.service';
import { Vintage } from '../../domain/portfolio';
import { prismaToVintage } from '../services/carbon-asset-allocation';
import { BusinessUnitRepositoryInterface } from '../../domain/business-unit';
import { StockRepositoryInterface } from '../../domain/order-book';
import { STOCK_REPOSITORY } from '../../infrastructure/repository/stock.prisma';
import { BUSINESS_UNIT_REPOSITORY } from '../../infrastructure/repository/business-unit.prisma';

@Resolver('Project')
export class ProjectResolver {
  private readonly logger = new Logger(ProjectResolver.name);

  constructor(
    private prisma: PrismaService,
    @Inject(BUSINESS_UNIT_REPOSITORY)
    private readonly businessUnitRepository: BusinessUnitRepositoryInterface,
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: StockRepositoryInterface,
  ) {}

  @Query('projects')
  async getProjects() {
    return await this.prisma.project.findMany();
  }
  @Query('projectBy')
  async projectsBy(@Args('field') field: string, @Args('value') value: string) {
    return this.prisma.project.findFirst({ where: { [field]: value } });
  }

  @Query('availableToAllocate')
  async availableToAllocate(
    @Args('project_id') projectId: string,
    @Args('business_unit_id') businessUnitId: string,
  ) {
    const businessUnit = await this.businessUnitRepository.byId(businessUnitId);
    if (null === businessUnit) {
      return {
        available_percent: 0,
        available_units: 0,
      };
    }
    const availableStock = await this.stockRepository.availableToAllocate(
      projectId,
      businessUnit.getDemands(),
    );

    return {
      available_percent: availableStock.percentage,
      available_units: availableStock.units,
    };
  }

  @ResolveField('vintages')
  async carbonCredits(@Parent() project: Project) {
    const { id } = project;
    return this.prisma.vintage.findMany({ where: { projectId: id } });
  }
  @ResolveField()
  async global_data(@Parent() project: Project) {
    const { id, riskAnalysis } = project;
    const allocations = await this.prisma.stock.findMany({
      where: {
        projectId: id,
        NOT: { allocationId: null },
      },
    });
    const stock = await this.prisma.stock.findMany({
      where: {
        projectId: id,
        businessUnitId: null,
        allocationId: null,
      },
    });
    const allocated_units = allocations.reduce(
      (acc, curr) => acc + curr.available + curr.consumed,
      0,
    );
    return {
      amount: parseInt(project.fundingAmount.toString()),
      source: project.type,
      rating: riskAnalysis,
      allocated_units,
      available_ex_post: Vintage.exPostStockAt(prismaToVintage(stock)),
      available_ex_ante: Vintage.exAnteStockAt(prismaToVintage(stock)),
    };
  }

  @ResolveField()
  async certifier(@Parent() project: Project) {
    const { certifierId } = project;
    return this.prisma.certifier.findFirst({ where: { id: certifierId } });
  }

  @ResolveField()
  async developper(@Parent() project: Project) {
    const { developperId } = project;
    return this.prisma.developper.findFirst({ where: { id: developperId } });
  }

  @ResolveField()
  async country(@Parent() project: Project) {
    const { countryId } = project;
    return this.prisma.country.findFirst({ where: { id: countryId } });
  }
}
